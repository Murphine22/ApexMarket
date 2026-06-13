const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const { validate } = require('../middlewares/validate');
const { inventoryValidators } = require('../validators');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory logs and stock movements
 */

/**
 * @swagger
 * /inventory/logs:
 *   get:
 *     summary: List inventory movement logs (audit trail)
 *     tags: [Inventory]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [restock, sale, wastage, adjustment] }
 *     responses:
 *       200: { description: Array of logs }
 */
router.get('/logs', authenticate, inventoryController.listLogs);

/**
 * @swagger
 * /inventory/low-stock:
 *   get:
 *     summary: List products at or below their low-stock threshold
 *     tags: [Inventory]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array of low-stock products }
 */
router.get('/low-stock', authenticate, inventoryController.lowStock);

/**
 * @swagger
 * /inventory/movements:
 *   post:
 *     summary: Record a manual stock movement (admin only)
 *     tags: [Inventory]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, movementType, quantity]
 *             properties:
 *               productId: { type: string }
 *               movementType: { type: string, enum: [restock, wastage, adjustment] }
 *               quantity: { type: integer }
 *               note: { type: string }
 *     responses:
 *       201: { description: Movement recorded }
 *       403: { description: Admins only }
 */
router.post(
  '/movements',
  authenticate,
  authorize('admin'),
  validate(inventoryValidators.movement),
  inventoryController.recordMovement
);

module.exports = router;
