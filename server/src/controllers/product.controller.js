const catchAsync = require('../utils/catchAsync');
const productService = require('../services/product.service');

const list = catchAsync(async (req, res) => {
  const products = await productService.list(req.query);
  res.json({ success: true, count: products.length, data: products });
});

const getOne = catchAsync(async (req, res) => {
  const product = await productService.getById(req.params.id);
  res.json({ success: true, data: product });
});

const create = catchAsync(async (req, res) => {
  const product = await productService.create(req.body, req.user?._id);
  res.status(201).json({ success: true, data: product });
});

const update = catchAsync(async (req, res) => {
  const product = await productService.update(req.params.id, req.body, req.user?._id);
  res.json({ success: true, data: product });
});

const remove = catchAsync(async (req, res) => {
  await productService.remove(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = { list, getOne, create, update, remove };
