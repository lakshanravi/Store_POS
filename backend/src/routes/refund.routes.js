const express = require('express');
const { body } = require('express-validator');
const ctrl     = require('../controllers/refund.controller');
const { authenticate }      = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/role.middleware');
const router   = express.Router();

router.use(authenticate, requirePermission('sales'));

router.get ('/',    ctrl.getAll);
router.get ('/:id', ctrl.getOne);
router.post('/', [
  body('sale_id').isInt().withMessage('sale_id required'),
  body('items').isArray({ min: 1 }).withMessage('Items required'),
  body('refund_method').notEmpty().withMessage('Refund method required'),
], ctrl.create);

module.exports = router;
