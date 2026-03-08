const express = require('express');
const { body } = require('express-validator');
const ctrl     = require('../controllers/sales.controller');
const { authenticate }      = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/role.middleware');
const router   = express.Router();

const saleRules = [
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.product_id').isInt().withMessage('Valid product_id required'),
  body('items.*.quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be > 0'),
  body('items.*.unit_price').isFloat({ min: 0 }).withMessage('unit_price required'),
  body('payments').isArray({ min: 1 }).withMessage('At least one payment required'),
  body('payments.*.payment_method_id').isInt().withMessage('payment_method_id required'),
  body('payments.*.amount').isFloat({ min: 0.01 }).withMessage('Payment amount required'),
];

router.use(authenticate, requirePermission('sales'));

router.get  ('/',          ctrl.getAll);
router.get  ('/:id',       ctrl.getOne);
router.post ('/',          saleRules, ctrl.create);
router.put  ('/:id/void',  ctrl.voidSale);

module.exports = router;
