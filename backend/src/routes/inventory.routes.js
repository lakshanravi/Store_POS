const express = require('express');
const { body } = require('express-validator');
const ctrl     = require('../controllers/inventory.controller');
const { authenticate }      = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/role.middleware');
const router   = express.Router();

router.use(authenticate, requirePermission('inventory'));

router.get ('/stock',      ctrl.getStock);
router.get ('/low-stock',  ctrl.getLowStock);
router.get ('/movements',  ctrl.getMovements);
router.post('/adjust', [
  body('product_id').isInt().withMessage('product_id required'),
  body('quantity_change').isFloat().withMessage('quantity_change required'),
], ctrl.adjust);

module.exports = router;
