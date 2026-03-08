function errorMiddleware(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({ field: e.path, message: e.message })),
    });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({ success: false, message: `Duplicate value for '${field}'.` });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ success: false, message: 'Referenced record not found.' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
}

module.exports = errorMiddleware;
