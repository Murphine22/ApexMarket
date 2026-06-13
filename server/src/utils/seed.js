/* Seed the database with demo users and products. Usage: npm run seed */
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const logger = require('./logger');
const User = require('../models/User');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const Transaction = require('../models/Transaction');
const { buildExtraProducts } = require('./catalog');

const USERS = [
  { name: 'Ada Admin', email: 'admin@apexmarket.io', password: 'admin123', role: 'admin' },
  { name: 'Sam Staff', email: 'staff@apexmarket.io', password: 'staff123', role: 'staff' },
];

const PRODUCTS = [
  { sku: 'PRD-1001', name: 'Organic Bananas', category: 'Produce', price: 1.29, cost: 0.6, stock: 8, lowStockThreshold: 15 },
  { sku: 'PRD-1002', name: 'Whole Milk 1L', category: 'Dairy', price: 2.49, cost: 1.3, stock: 42, lowStockThreshold: 20 },
  { sku: 'PRD-1003', name: 'Sourdough Loaf', category: 'Bakery', price: 3.99, cost: 1.7, stock: 6, lowStockThreshold: 10 },
  { sku: 'PRD-1004', name: 'Cold Brew Coffee', category: 'Beverages', price: 4.5, cost: 2.1, stock: 30, lowStockThreshold: 12 },
  { sku: 'PRD-1005', name: 'Sea Salt Chips', category: 'Snacks', price: 2.99, cost: 1.1, stock: 55, lowStockThreshold: 25 },
  { sku: 'PRD-1006', name: 'Dish Soap', category: 'Household', price: 3.25, cost: 1.4, stock: 3, lowStockThreshold: 12 },
  { sku: 'PRD-1007', name: 'Frozen Berries', category: 'Frozen', price: 5.75, cost: 2.6, stock: 18, lowStockThreshold: 10 },
  { sku: 'PRD-1008', name: 'Shampoo 500ml', category: 'Personal Care', price: 6.99, cost: 3.0, stock: 24, lowStockThreshold: 10 },
];

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
  for (const u of USERS) await User.create(u); // create() triggers password hashing

  logger.info('Seeding products…');
  const allProducts = [...PRODUCTS, ...buildExtraProducts(100)];
  await Product.insertMany(allProducts);
  logger.info(`Seeded ${allProducts.length} products.`);

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
