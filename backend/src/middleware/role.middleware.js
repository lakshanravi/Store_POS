function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user?.permissions?.[permission]) {
      return res.status(403).json({ success: false, message: `Permission '${permission}' required.` });
    }
    next();
  };
}

module.exports = { requireRole, requirePermission };
