const express = require('express');
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const { validate } = require('../middlewares/validate');
const { productValidators } = require('../validators');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200: { description: Array of products }
 *   post:
 *     summary: Create a product (admin only)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Product created }
 *       403: { description: Admins only }
 */
router
  .route('/')
  .get(authenticate, productController.list)
  .post(authenticate, authorize('admin'), validate(productValidators.create), productController.create);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by id
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product }
 *       404: { description: Not found }
 *   put:
 *     summary: Update a product (admin only)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *       403: { description: Admins only }
 *   delete:
 *     summary: Delete a product (admin only)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 *       403: { description: Admins only }
 */
router
  .route('/:id')
  .get(authenticate, validate(productValidators.idParam), productController.getOne)
  .put(authenticate, authorize('admin'), validate(productValidators.update), productController.update)
  .delete(authenticate, authorize('admin'), validate(productValidators.idParam), productController.remove);

module.exports = router;
