/* Seed the database with demo users and products. Usage: npm run seed */
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const logger = require('./logger');
const User = require('../models/User');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const Transaction = require('../models/Transaction');
const { buildExtraProducts, toNaira } = require('./catalog');

const USERS = [
  { name: 'Ada Admin', email: 'admin@apexmarket.io', password: 'admin123', role: 'admin' },
  { name: 'Sam Staff', email: 'staff@apexmarket.io', password: 'staff123', role: 'staff' },
];

const img = (q) => `https://images.unsplash.com/${q}?auto=format&fit=crop&w=400&q=60`;

// 12 curated, image-rich hero products (kept in sync with the frontend demo).
const PRODUCTS = [
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

const TAX_RATE = 0.08;
const round = (n) => Math.round(n * 100) / 100;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Build ~30 days of synthetic sales + inventory movements so the dashboard,
// reports and audit trail are populated immediately in live API mode.
function buildHistory(products, users) {
  const day = 86400000;
  const now = Date.now();
  const transactions = [];
  const logs = [];
  for (let d = 29; d >= 0; d--) {
    const count = 3 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const itemCount = 1 + Math.floor(Math.random() * 4);
      const items = [];
      let subtotal = 0;
      for (let k = 0; k < itemCount; k++) {
        const p = pick(products);
        const quantity = 1 + Math.floor(Math.random() * 3);
        items.push({ product: p._id, sku: p.sku, name: p.name, price: p.price, quantity });
        subtotal += p.price * quantity;
      }
      const tax = round(subtotal * TAX_RATE);
      const cashier = pick(users);
      const createdAt = new Date(now - d * day - Math.floor(Math.random() * day));
      transactions.push({
        items, subtotal: round(subtotal), tax, total: round(subtotal + tax),
        paymentMethod: pick(['cash', 'card', 'mobile']),
        cashier: cashier._id, cashierName: cashier.name, createdAt,
      });
    }
  }
  for (let i = 0; i < 40; i++) {
    const p = pick(products);
    const movementType = pick(['restock', 'sale', 'wastage', 'adjustment']);
    const sign = movementType === 'sale' || movementType === 'wastage' ? -1 : 1;
    logs.push({
      product: p._id, sku: p.sku, name: p.name, movementType,
      quantity: sign * (1 + Math.floor(Math.random() * 8)),
      createdAt: new Date(now - Math.floor(Math.random() * 20 * day)),
    });
  }
  return { transactions, logs };
}

async function seed() {
  await connectDB();
  logger.info('Clearing existing data…');
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    InventoryLog.deleteMany({}),
    Transaction.deleteMany({}),
  ]);

  logger.info('Seeding users…');
  const users = [];
  for (const u of USERS) users.push(await User.create(u)); // create() triggers password hashing

  logger.info('Seeding products…');
  // Curated prices/costs are authored in USD; convert them to Naira for consistency.
  const curated = PRODUCTS.map((p) => ({ ...p, price: toNaira(p.price), cost: toNaira(p.cost) }));
  const allProducts = [...curated, ...buildExtraProducts(100)];
  const products = await Product.insertMany(allProducts);
  logger.info(`Seeded ${products.length} products.`);

  logger.info('Seeding transaction + inventory history…');
  const { transactions, logs } = buildHistory(products, users);
  await Transaction.insertMany(transactions);
  await InventoryLog.insertMany(logs);
  logger.info(`Seeded ${transactions.length} transactions and ${logs.length} inventory logs.`);

  logger.info('Seed complete.');
  logger.info('Admin login: admin@apexmarket.io / admin123');
  logger.info('Staff login: staff@apexmarket.io / staff123');

  await disconnectDB();
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
