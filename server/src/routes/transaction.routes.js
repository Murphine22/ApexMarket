const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { transactionValidators } = require('../validators');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Point-of-sale transactions
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: List transactions
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array of transactions }
 *   post:
 *     summary: Create a sale (validates & decrements stock)
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, paymentMethod]
 *             properties:
 *               paymentMethod: { type: string, enum: [cash, card, mobile] }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sku: { type: string }
 *                     quantity: { type: integer }
 *     responses:
 *       201: { description: Sale completed }
 *       400: { description: Insufficient stock or invalid items }
 */
router
  .route('/')
  .get(authenticate, transactionController.list)
  .post(authenticate, validate(transactionValidators.create), transactionController.create);

module.exports = router;
