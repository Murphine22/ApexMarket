const catchAsync = require('../utils/catchAsync');
const transactionService = require('../services/transaction.service');

const list = catchAsync(async (req, res) => {
  const transactions = await transactionService.list(req.query);
  res.json({ success: true, count: transactions.length, data: transactions });
});

const create = catchAsync(async (req, res) => {
  const transaction = await transactionService.create({
    items: req.body.items,
    paymentMethod: req.body.paymentMethod,
    cashier: { id: req.user?._id, name: req.user?.name },
  });
  res.status(201).json({ success: true, data: transaction });
});

module.exports = { list, create };
