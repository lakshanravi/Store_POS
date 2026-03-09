const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes      = require('./routes/auth.routes');
const productRoutes   = require('./routes/product.routes');
const categoryRoutes  = require('./routes/category.routes');
const supplierRoutes  = require('./routes/supplier.routes');
const customerRoutes  = require('./routes/customer.routes');
const salesRoutes     = require('./routes/sales.routes');
const refundRoutes    = require('./routes/refund.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const reportRoutes    = require('./routes/report.routes');
const settingsRoutes  = require('./routes/settings.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter — all API routes
app.use('/api/', rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 500,
  message  : { success: false, message: 'Too many requests. Try again later.' },
}));

// Stricter limiter for login
const authLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 20,
  message  : { success: false, message: 'Too many login attempts. Wait 15 minutes.' },
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'POS API is running', time: new Date() });
});

// Routes
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/products',               productRoutes);
app.use('/api/categories',             categoryRoutes);
app.use('/api/suppliers',              supplierRoutes);
app.use('/api/customers',              customerRoutes);
app.use('/api/sales',                  salesRoutes);
app.use('/api/refunds',                refundRoutes);
app.use('/api/inventory',              inventoryRoutes);
app.use('/api/reports',                reportRoutes);
app.use('/api/settings',               settingsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;
