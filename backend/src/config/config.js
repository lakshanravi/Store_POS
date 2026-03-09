module.exports = {
  jwt: {
    secret          : process.env.JWT_SECRET || 'dev-secret',
    expiresIn       : process.env.JWT_EXPIRES_IN || '8h',
    refreshSecret   : process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  },
  pagination: {
    defaultLimit: 20,
    maxLimit    : 100,
  },
  roles: {
    ADMIN  : 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier',
  },
};
