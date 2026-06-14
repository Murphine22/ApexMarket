const InventoryLog = require('../models/InventoryLog');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

async function listLogs({ limit = 200, type } = {}) {
  const filter = {};
  if (type && type !== 'all') filter.movementType = type;
  return InventoryLog.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
}

// Records a manual stock movement (restock / wastage / adjustment) and updates stock.
async function recordMovement({ productId, movementType, quantity, note }, actorId) {
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const delta = movementType === 'wastage' ? -Math.abs(quantity) : quantity;
  if (product.stock + delta < 0) {
    throw ApiError.badRequest('Movement would drive stock below zero');
  }
  product.stock += delta;
  await product.save();

  return InventoryLog.create({
    product: product._id,
    sku: product.sku,
    name: product.name,
    movementType,
    quantity: delta,
    note,
    actor: actorId,
  });
}

async function lowStock() {
  // $expr lets us compare two fields of the same document.
  return Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } });
}

module.exports = { listLogs, recordMovement, lowStock };
