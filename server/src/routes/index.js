const express = require('express');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const transactionRoutes = require('./transaction.routes');
const inventoryRoutes = require('./inventory.routes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', service: 'apexmarket-api', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/transactions', transactionRoutes);
router.use('/inventory', inventoryRoutes);

module.exports = router;
