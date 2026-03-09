const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { User, Role } = require('../models');
const { jwt: jwtConfig, bcrypt: bcryptConfig } = require('../config/config');

function generateTokens(payload) {
  const accessToken  = jwt.sign(payload, jwtConfig.secret,        { expiresIn: jwtConfig.expiresIn });
  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret,  { expiresIn: jwtConfig.refreshExpiresIn });
  return { accessToken, refreshToken };
}

async function loginWithPassword(username, password) {
  const user = await User.scope('withPassword').findOne({
    where: { username, is_active: true },
    include: [{ model: Role, as: 'role' }],
  });
  if (!user) throw new Error('Invalid username or password');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid username or password');

  await user.update({ last_login: new Date() });
const perms = typeof user.role.permissions === 'string' ? JSON.parse(user.role.permissions) : user.role.permissions;
const payload = { id: user.id, username: user.username, role: user.role.name, permissions: perms };
  return { user: sanitizeUser(user), ...generateTokens(payload) };
}

async function loginWithPin(username, pin) {
  const user = await User.scope('withPassword').findOne({
    where: { username, is_active: true },
    include: [{ model: Role, as: 'role' }],
  });
  if (!user || !user.pin_hash) throw new Error('PIN login not available');

  const valid = await bcrypt.compare(String(pin), user.pin_hash);
  if (!valid) throw new Error('Invalid PIN');

  await user.update({ last_login: new Date() });

  const perms = typeof user.role.permissions === 'string' ? JSON.parse(user.role.permissions) : user.role.permissions;
const payload = { id: user.id, username: user.username, role: user.role.name, permissions: perms };
  return { user: sanitizeUser(user), ...generateTokens(payload) };
}

async function refreshAccessToken(refreshToken) {
  let decoded;
  try { decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret); }
  catch { throw new Error('Invalid or expired refresh token'); }

  const user = await User.findOne({
    where: { id: decoded.id, is_active: true },
    include: [{ model: Role, as: 'role' }],
  });
  if (!user) throw new Error('User not found');

  const perms = typeof user.role.permissions === 'string' ? JSON.parse(user.role.permissions) : user.role.permissions;
const payload = { id: user.id, username: user.username, role: user.role.name, permissions: perms };
  const accessToken = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
  return { accessToken };
}

async function hashPassword(password) { return bcrypt.hash(password, bcryptConfig.rounds); }
async function hashPin(pin)           { return bcrypt.hash(String(pin), bcryptConfig.rounds); }

function sanitizeUser(user) {
  const data = user.toJSON();
  delete data.password_hash;
  delete data.pin_hash;
  return data;
}

module.exports = { loginWithPassword, loginWithPin, refreshAccessToken, hashPassword, hashPin };
