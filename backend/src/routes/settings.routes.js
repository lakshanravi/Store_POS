const express = require('express');
const ctrl    = require('../controllers/settings.controller');
const { authenticate }      = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/role.middleware');
const router  = express.Router();

router.use(authenticate);

router.get ('/', ctrl.get);
router.put ('/', requirePermission('settings'), ctrl.update);

module.exports = router;

// Payment methods list (public read for POS screen)
const { PaymentMethod } = require('../models');
router.get('/payment-methods', async (req, res, next) => {
  try {
    const methods = await PaymentMethod.findAll({ where: { is_active: true }, order: [['sort_order','ASC']] });
    res.json({ success: true, data: { methods } });
  } catch (err) { next(err); }
});
