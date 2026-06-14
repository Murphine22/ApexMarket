const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const ApiError = require('../utils/ApiError');

const TAX_RATE = 0.08;

async function list({ limit = 100 } = {}) {
  return Transaction.find().sort({ createdAt: -1 }).limit(Number(limit));
}

// Creates a sale. Stock availability for every line item is validated up front,
// so the sale is rejected atomically (nothing is written) if any item is short.
// Stock decrements + inventory logs are then applied per item.
async function create({ items, paymentMethod, cashier }) {
  const skus = items.map((i) => i.sku);
  const products = await Product.find({ sku: { $in: skus } });
  const bySku = new Map(products.map((p) => [p.sku, p]));

  let subtotal = 0;
  const resolved = items.map((item) => {
    const product = bySku.get(item.sku);
    if (!product) throw ApiError.badRequest(`Unknown product: ${item.sku}`);
    if (product.stock < item.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for ${product.name} (have ${product.stock}, need ${item.quantity})`
      );
    }
    subtotal += product.price * item.quantity;
    return { product, quantity: item.quantity };
  });

  const round = (n) => Math.round(n * 100) / 100;
  const tax = round(subtotal * TAX_RATE);
  const total = round(subtotal + tax);

  // Apply stock changes + audit logs only after validation passed.
  for (const { product, quantity } of resolved) {
    product.stock -= quantity;
    await product.save();
    await InventoryLog.create({
      product: product._id,
      sku: product.sku,
      name: product.name,
      movementType: 'sale',
      quantity: -quantity,
      actor: cashier?.id,
    });
  }

  return Transaction.create({
    items: resolved.map(({ product, quantity }) => ({
      product: product._id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      quantity,
    })),
    subtotal: round(subtotal),
    tax,
    total,
    paymentMethod,
    cashier: cashier?.id,
    cashierName: cashier?.name,
  });
}

module.exports = { list, create, TAX_RATE };
