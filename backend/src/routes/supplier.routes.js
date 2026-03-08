const express = require('express');
const { body } = require('express-validator');
const ctrl     = require('../controllers/supplier.controller');
const { authenticate }      = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/role.middleware');
const router   = express.Router();

router.use(authenticate);
router.get ('/',    ctrl.getAll);
router.get ('/:id', ctrl.getOne);
router.post('/',    requirePermission('inventory'), [body('name').trim().notEmpty()], ctrl.create);
router.put ('/:id', requirePermission('inventory'), ctrl.update);
router.delete('/:id', requirePermission('inventory'), ctrl.remove);

module.exports = router;
