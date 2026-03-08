const express    = require('express');
const { body }   = require('express-validator');
const ctrl       = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router     = express.Router();

const loginRules = [
  body('username').trim().notEmpty().withMessage('Username required'),
  body('password').notEmpty().withMessage('Password required'),
];
const pinRules = [
  body('username').trim().notEmpty().withMessage('Username required'),
  body('pin').isLength({min:4,max:6}).isNumeric().withMessage('PIN must be 4-6 digits'),
];
const changePwRules = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({min:8}).withMessage('Min 8 characters')
    .matches(/[A-Z]/).withMessage('Need uppercase').matches(/[0-9]/).withMessage('Need number'),
];

router.post('/login',           loginRules,    ctrl.login);
router.post('/login-pin',       pinRules,      ctrl.loginPin);
router.post('/refresh',                        ctrl.refresh);
router.get ('/me',              authenticate,  ctrl.me);
router.post('/change-password', authenticate, changePwRules, ctrl.changePassword);
router.post('/set-pin',         authenticate, [body('pin').isLength({min:4,max:6}).isNumeric()], ctrl.setPin);
router.post('/logout',          authenticate,  ctrl.logout);

module.exports = router;
