const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const { User, Role } = require('../models');

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const result = await authService.loginWithPassword(req.body.username, req.body.password);
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err) {
    err.message.includes('Invalid')
      ? res.status(401).json({ success: false, message: err.message })
      : next(err);
  }
}

async function loginPin(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const result = await authService.loginWithPin(req.body.username, req.body.pin);
    res.json({ success: true, message: 'PIN login successful', data: result });
  } catch (err) {
    ['Invalid','not available'].some(s => err.message.includes(s))
      ? res.status(401).json({ success: false, message: err.message })
      : next(err);
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const result = await authService.refreshAccessToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findOne({
      where: { id: req.user.id, is_active: true },
      include: [{ model: Role, as: 'role' }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
}

async function changePassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const bcrypt = require('bcryptjs');
    const user   = await User.scope('withPassword').findByPk(req.user.id);
    const valid  = await bcrypt.compare(req.body.currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    await user.update({ password_hash: await authService.hashPassword(req.body.newPassword) });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
}

async function setPin(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
    await User.update({ pin_hash: await authService.hashPin(req.body.pin) }, { where: { id: req.user.id } });
    res.json({ success: true, message: 'PIN set successfully' });
  } catch (err) { next(err); }
}

async function logout(req, res) {
  res.json({ success: true, message: 'Logged out successfully' });
}

module.exports = { login, loginPin, refresh, me, changePassword, setPin, logout };
