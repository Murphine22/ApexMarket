// In-memory + localStorage "database" backing demo mode.
// Mimics the backend's REST semantics so the UI behaves identically
// whether it talks to this or the real Express/Mongo API.

import {
  DEMO_PRODUCTS,
  DEMO_USERS,
  buildDemoTransactions,
  buildDemoLogs,
} from './demoData';

const KEY = 'apexmarket_demo_db_v1';

function seed() {
  const products = DEMO_PRODUCTS.map((p, i) => ({
    _id: `p${i + 1}`,
    ...p,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
  return {
    products,
    transactions: buildDemoTransactions(products),
    logs: buildDemoLogs(products),
    users: DEMO_USERS,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const db = seed();
  save(db);
  return db;
}

function save(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* ignore quota errors */
  }
}

let db = load();

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export function resetDemoDb() {
  db = seed();
  save(db);
  return db;
}

export const demoApi = {
  async login(email, password) {
    await delay();
    const user = db.users.find((u) => u.email === email && u.password === password);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }
    const { password: _pw, ...safe } = user;
    return { user: safe, token: `demo.${btoa(user.email)}.token` };
  },

  async register({ name, email, password, role = 'staff' }) {
    await delay();
    if (db.users.some((u) => u.email === email)) {
      const err = new Error('Email already registered');
      err.status = 409;
      throw err;
    }
    const user = { id: uid('u'), name, email, password, role };
    db.users.push(user);
    save(db);
    const { password: _pw, ...safe } = user;
    return { user: safe, token: `demo.${btoa(email)}.token` };
  },

  async getProducts() {
    await delay(120);
    return [...db.products];
  },

  async createProduct(payload) {
    await delay();
    const product = {
      _id: uid('p'),
      lowStockThreshold: 10,
      cost: 0,
      image: '',
      ...payload,
      stock: Number(payload.stock) || 0,
      price: Number(payload.price) || 0,
      createdAt: new Date().toISOString(),
    };
    db.products.unshift(product);
    db.logs.unshift({
      id: uid('LOG'),
      sku: product.sku,
      name: product.name,
      movementType: 'restock',
      quantity: product.stock,
      createdAt: new Date().toISOString(),
    });
    save(db);
    return product;
  },

  async updateProduct(id, payload) {
    await delay();
    const idx = db.products.findIndex((p) => p._id === id);
    if (idx === -1) throw new Error('Product not found');
    db.products[idx] = { ...db.products[idx], ...payload };
    save(db);
    return db.products[idx];
  },

  async deleteProduct(id) {
    await delay();
    db.products = db.products.filter((p) => p._id !== id);
    save(db);
    return { success: true };
  },

  async getTransactions() {
    await delay(120);
    return [...db.transactions];
  },

  async createTransaction({ items, paymentMethod, cashier }) {
    await delay();
    // Validate stock availability (atomic-ish) before finalizing sale.
    for (const item of items) {
      const p = db.products.find((x) => x.sku === item.sku);
      if (!p) throw new Error(`Unknown product ${item.sku}`);
      if (p.stock < item.quantity) {
        const err = new Error(`Insufficient stock for ${p.name}`);
        err.status = 400;
        throw err;
      }
    }
    let total = 0;
    items.forEach((item) => {
      const p = db.products.find((x) => x.sku === item.sku);
      p.stock -= item.quantity;
      total += p.price * item.quantity;
      db.logs.unshift({
        id: uid('LOG'),
        sku: p.sku,
        name: p.name,
        movementType: 'sale',
        quantity: -item.quantity,
        createdAt: new Date().toISOString(),
      });
    });
    const txn = {
      id: uid('TXN'),
      items,
      total: Math.round(total * 100) / 100,
      paymentMethod,
      cashier,
      createdAt: new Date().toISOString(),
    };
    db.transactions.unshift(txn);
    save(db);
    return txn;
  },

  async getLogs() {
    await delay(120);
    return [...db.logs];
  },

  async recordMovement({ productId, sku, movementType, quantity, note }) {
    await delay();
    const product = db.products.find((p) => p._id === productId || p.sku === sku);
    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }
    const delta = movementType === 'wastage' ? -Math.abs(quantity) : Number(quantity);
    if (product.stock + delta < 0) {
      const err = new Error('Movement would drive stock below zero');
      err.status = 400;
      throw err;
    }
    product.stock += delta;
    const log = {
      id: uid('LOG'),
      sku: product.sku,
      name: product.name,
      movementType,
      quantity: delta,
      note: note || '',
      createdAt: new Date().toISOString(),
    };
    db.logs.unshift(log);
    save(db);
    return log;
  },

  async getLowStock() {
    await delay(120);
    return db.products.filter((p) => p.stock <= (p.lowStockThreshold ?? 10));
  },
};
