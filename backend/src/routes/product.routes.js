const express = require('express');
const { body } = require('express-validator');
const ctrl     = require('../controllers/product.controller');
const { authenticate }       = require('../middleware/auth.middleware');
const { requirePermission }  = require('../middleware/role.middleware');
const router   = express.Router();

const rules = [
  body('name').trim().notEmpty().withMessage('Product name required'),
  body('selling_price').isFloat({min:0}).withMessage('Selling price must be a positive number'),
  body('cost_price').optional().isFloat({min:0}).withMessage('Cost price must be positive'),
];

router.use(authenticate);

router.get ('/',               ctrl.getAll);
router.get ('/low-stock',      ctrl.getAll);   // pass ?low_stock=true
router.get ('/barcode/:code',  ctrl.getByBarcode);
router.get ('/:id',            ctrl.getOne);
router.post('/',               requirePermission('products'), rules, ctrl.create);
router.put ('/:id',            requirePermission('products'), rules, ctrl.update);
router.delete('/:id',          requirePermission('products'), ctrl.remove);

module.exports = router;
