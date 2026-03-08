const express = require('express');
const ctrl    = require('../controllers/report.controller');
const { authenticate }      = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/role.middleware');
const router  = express.Router();

router.use(authenticate, requirePermission('reports'));

router.get('/daily',        ctrl.dailySales);
router.get('/profit-loss',  ctrl.profitLoss);
router.get('/refunds',      ctrl.refundLog);

module.exports = router;
