const Role             = require('./Role');
const User             = require('./User');
const Category         = require('./Category');
const Supplier         = require('./Supplier');
const Product          = require('./Product');
const Customer         = require('./Customer');
const PaymentMethod    = require('./PaymentMethod');
const Sale             = require('./Sale');
const SaleItem         = require('./SaleItem');
const SalePayment      = require('./SalePayment');
const Refund           = require('./Refund');
const RefundItem       = require('./RefundItem');
const StockMovement    = require('./StockMovement');
const StoreSettings    = require('./StoreSettings');
const DailySummary     = require('./DailySummary');
const PurchaseOrder    = require('./PurchaseOrder');
const PurchaseOrderItem= require('./PurchaseOrderItem');
const AuditLog         = require('./AuditLog');

// ── Associations ──────────────────────────────────
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Supplier.hasMany(Product, { foreignKey: 'supplier_id', as: 'products' });
Product.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

User.hasMany(Sale, { foreignKey: 'cashier_id', as: 'sales' });
Sale.belongsTo(User, { foreignKey: 'cashier_id', as: 'cashier' });

Customer.hasMany(Sale, { foreignKey: 'customer_id', as: 'sales' });
Sale.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

Sale.hasMany(SaleItem,      { foreignKey: 'sale_id', as: 'items' });
SaleItem.belongsTo(Sale,    { foreignKey: 'sale_id', as: 'sale' });
SaleItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Sale.hasMany(SalePayment,           { foreignKey: 'sale_id', as: 'payments' });
SalePayment.belongsTo(Sale,         { foreignKey: 'sale_id' });
SalePayment.belongsTo(PaymentMethod,{ foreignKey: 'payment_method_id', as: 'method' });

Sale.hasMany(Refund,    { foreignKey: 'sale_id', as: 'refunds' });
Refund.belongsTo(Sale,  { foreignKey: 'sale_id', as: 'sale' });
Refund.belongsTo(User,  { foreignKey: 'cashier_id', as: 'cashier' });
Refund.hasMany(RefundItem,    { foreignKey: 'refund_id', as: 'items' });
RefundItem.belongsTo(Refund,  { foreignKey: 'refund_id' });
RefundItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(StockMovement,    { foreignKey: 'product_id', as: 'movements' });
StockMovement.belongsTo(Product,  { foreignKey: 'product_id', as: 'product' });
StockMovement.belongsTo(User,     { foreignKey: 'performed_by', as: 'performer' });

Supplier.hasMany(PurchaseOrder,   { foreignKey: 'supplier_id', as: 'orders' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
PurchaseOrder.belongsTo(User,     { foreignKey: 'created_by', as: 'creator' });
PurchaseOrder.hasMany(PurchaseOrderItem,    { foreignKey: 'purchase_order_id', as: 'items' });
PurchaseOrderItem.belongsTo(PurchaseOrder,  { foreignKey: 'purchase_order_id' });
PurchaseOrderItem.belongsTo(Product,        { foreignKey: 'product_id', as: 'product' });

AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  Role, User, Category, Supplier, Product, Customer,
  PaymentMethod, Sale, SaleItem, SalePayment,
  Refund, RefundItem, StockMovement,
  StoreSettings, DailySummary,
  PurchaseOrder, PurchaseOrderItem, AuditLog,
};