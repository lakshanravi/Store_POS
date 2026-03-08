const express = require('express');
const { body } = require('express-validator');
const ctrl     = require('../controllers/category.controller');
const { authenticate }      = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/role.middleware');
const router   = express.Router();

router.use(authenticate);
router.get ('/',    ctrl.getAll);
router.get ('/:id', ctrl.getOne);
router.post('/',    requirePermission('products'), [body('name').trim().notEmpty()], ctrl.create);
router.put ('/:id', requirePermission('products'), ctrl.update);
router.delete('/:id', requirePermission('products'), ctrl.remove);

module.exports = router;
