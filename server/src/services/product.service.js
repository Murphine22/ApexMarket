const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const ApiError = require('../utils/ApiError');

async function list({ search, category } = {}) {
  const filter = {};
  if (category && category !== 'All') filter.category = category;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }
  return Product.find(filter).sort({ createdAt: -1 });
}

async function getById(id) {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

async function create(data, actorId) {
  const product = await Product.create(data);
  if (product.stock > 0) {
    await InventoryLog.create({
      product: product._id,
      sku: product.sku,
      name: product.name,
      movementType: 'restock',
      quantity: product.stock,
      note: 'Initial stock',
      actor: actorId,
    });
  }
  return product;
}

async function update(id, data, actorId) {
  const product = await getById(id);
  const prevStock = product.stock;
  Object.assign(product, data);
  await product.save();

  // Record manual stock adjustments for the audit trail.
  if (data.stock !== undefined && data.stock !== prevStock) {
    await InventoryLog.create({
      product: product._id,
      sku: product.sku,
      name: product.name,
      movementType: 'adjustment',
      quantity: data.stock - prevStock,
      note: 'Manual stock adjustment',
      actor: actorId,
    });
  }
  return product;
}

async function remove(id) {
  const product = await getById(id);
  await product.deleteOne();
  return { success: true };
}

module.exports = { list, getById, create, update, remove };
