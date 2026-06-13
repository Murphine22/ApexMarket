// Seed data used when the app runs in standalone "demo mode" (no backend required).
// This lets http://localhost:3000 be fully interactive out of the box.

import { buildExtraProducts } from './catalog';

export const CATEGORIES = [
  'Produce',
  'Dairy',
  'Bakery',
  'Beverages',
  'Snacks',
  'Household',
  'Frozen',
  'Personal Care',
];

const img = (q) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=400&q=60`;

// A dozen curated, image-rich "hero" products.
const CURATED_PRODUCTS = [
  { sku: 'PRD-1001', name: 'Organic Bananas', category: 'Produce', price: 1.29, cost: 0.6, stock: 8, lowStockThreshold: 15, image: img('photo-1571771894821-ce9b6c11b08e') },
  { sku: 'PRD-1002', name: 'Whole Milk 1L', category: 'Dairy', price: 2.49, cost: 1.3, stock: 42, lowStockThreshold: 20, image: img('photo-1550583724-b2692b85b150') },
  { sku: 'PRD-1003', name: 'Sourdough Loaf', category: 'Bakery', price: 3.99, cost: 1.7, stock: 6, lowStockThreshold: 10, image: img('photo-1509440159596-0249088772ff') },
  { sku: 'PRD-1004', name: 'Cold Brew Coffee', category: 'Beverages', price: 4.5, cost: 2.1, stock: 30, lowStockThreshold: 12, image: img('photo-1517701550927-30cf4ba1dba5') },
  { sku: 'PRD-1005', name: 'Sea Salt Chips', category: 'Snacks', price: 2.99, cost: 1.1, stock: 55, lowStockThreshold: 25, image: img('photo-1566478989037-eec170784d0b') },
  { sku: 'PRD-1006', name: 'Dish Soap', category: 'Household', price: 3.25, cost: 1.4, stock: 3, lowStockThreshold: 12, image: img('photo-1585421514738-01798e348b17') },
  { sku: 'PRD-1007', name: 'Frozen Berries', category: 'Frozen', price: 5.75, cost: 2.6, stock: 18, lowStockThreshold: 10, image: img('photo-1577003833619-76bbd7f82948') },
  { sku: 'PRD-1008', name: 'Shampoo 500ml', category: 'Personal Care', price: 6.99, cost: 3.0, stock: 24, lowStockThreshold: 10, image: img('photo-1556228720-195a672e8a03') },
  { sku: 'PRD-1009', name: 'Greek Yogurt', category: 'Dairy', price: 1.89, cost: 0.8, stock: 9, lowStockThreshold: 18, image: img('photo-1488477181946-6428a0291777') },
  { sku: 'PRD-1010', name: 'Sparkling Water', category: 'Beverages', price: 1.15, cost: 0.45, stock: 80, lowStockThreshold: 30, image: img('photo-1622483767028-3f66f32aef97') },
  { sku: 'PRD-1011', name: 'Avocado (each)', category: 'Produce', price: 1.6, cost: 0.7, stock: 14, lowStockThreshold: 20, image: img('photo-1523049673857-eb18f1d7b578') },
  { sku: 'PRD-1012', name: 'Dark Chocolate', category: 'Snacks', price: 3.49, cost: 1.5, stock: 40, lowStockThreshold: 15, image: img('photo-1548907040-4baa42d10919') },
];

// Catalog generator — produces a large, realistic supermarket inventory so the
// store feels fully stocked. Used by both the frontend demo and backend seed.
export const DEMO_PRODUCTS = [...CURATED_PRODUCTS, ...buildExtraProducts(100)];

export const DEMO_USERS = [
  { id: 'u-admin', name: 'Ada Admin', email: 'admin@apexmarket.io', role: 'admin', password: 'admin123' },
  { id: 'u-staff', name: 'Sam Staff', email: 'staff@apexmarket.io', role: 'staff', password: 'staff123' },
];

// Build ~30 days of synthetic transaction history for the analytics dashboard.
export function buildDemoTransactions(products) {
  const txns = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  let counter = 5000;
  for (let d = 29; d >= 0; d--) {
    const count = 3 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const itemCount = 1 + Math.floor(Math.random() * 4);
      const items = [];
      let total = 0;
      for (let k = 0; k < itemCount; k++) {
        const p = products[Math.floor(Math.random() * products.length)];
        const qty = 1 + Math.floor(Math.random() * 3);
        items.push({ sku: p.sku, name: p.name, price: p.price, quantity: qty });
        total += p.price * qty;
      }
      txns.push({
        id: `TXN-${counter++}`,
        items,
        total: Math.round(total * 100) / 100,
        paymentMethod: ['cash', 'card', 'mobile'][Math.floor(Math.random() * 3)],
        cashier: Math.random() > 0.5 ? 'Sam Staff' : 'Ada Admin',
        createdAt: new Date(now - d * day - Math.floor(Math.random() * day)).toISOString(),
      });
    }
  }
  return txns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function buildDemoLogs(products) {
  const logs = [];
  const now = Date.now();
  let counter = 9000;
  const types = ['restock', 'sale', 'wastage', 'adjustment'];
  for (let i = 0; i < 40; i++) {
    const p = products[Math.floor(Math.random() * products.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const qty = (type === 'sale' || type === 'wastage' ? -1 : 1) * (1 + Math.floor(Math.random() * 8));
    logs.push({
      id: `LOG-${counter++}`,
      sku: p.sku,
      name: p.name,
      movementType: type,
      quantity: qty,
      createdAt: new Date(now - Math.floor(Math.random() * 20 * 86400000)).toISOString(),
    });
  }
  return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
