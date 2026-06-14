const catchAsync = require('../utils/catchAsync');
const inventoryService = require('../services/inventory.service');

const listLogs = catchAsync(async (req, res) => {
  const logs = await inventoryService.listLogs(req.query);
  res.json({ success: true, count: logs.length, data: logs });
});

const recordMovement = catchAsync(async (req, res) => {
  const log = await inventoryService.recordMovement(req.body, req.user?._id);
  res.status(201).json({ success: true, data: log });
});

const lowStock = catchAsync(async (_req, res) => {
  const products = await inventoryService.lowStock();
  res.json({ success: true, count: products.length, data: products });
});

module.exports = { listLogs, recordMovement, lowStock };
