const { body, param } = require('express-validator');

const authValidators = {
  register: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'staff']),
  ],
  login: [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
};

const productValidators = {
  create: [
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be >= 0'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be >= 0'),
    body('cost').optional().isFloat({ min: 0 }),
    body('lowStockThreshold').optional().isInt({ min: 0 }),
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid product id'),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
    body('cost').optional().isFloat({ min: 0 }),
    body('lowStockThreshold').optional().isInt({ min: 0 }),
  ],
  idParam: [param('id').isMongoId().withMessage('Invalid product id')],
};

const transactionValidators = {
  create: [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.sku').notEmpty().withMessage('Each item needs a sku'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1'),
    body('paymentMethod').isIn(['cash', 'card', 'mobile']).withMessage('Invalid payment method'),
  ],
};

const inventoryValidators = {
  movement: [
    body('productId').isMongoId().withMessage('Invalid product id'),
    body('movementType').isIn(['restock', 'wastage', 'adjustment']).withMessage('Invalid movement type'),
    body('quantity').isInt().withMessage('Quantity must be an integer'),
  ],
};

module.exports = {
  authValidators,
  productValidators,
  transactionValidators,
  inventoryValidators,
};
