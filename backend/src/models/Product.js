const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('products', {
  id              : { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  category_id     : { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  supplier_id     : { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  name            : { type: DataTypes.STRING(200), allowNull: false },
  slug            : { type: DataTypes.STRING(210), allowNull: false, unique: true },
  sku             : { type: DataTypes.STRING(80),  unique: true },
  barcode         : { type: DataTypes.STRING(100), unique: true },
  barcode_type    : {
    type: DataTypes.ENUM('EAN13','EAN8','UPC','CODE128','QR','CUSTOM'),
    defaultValue: 'EAN13',
  },
  cost_price      : { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0.00 },
  selling_price   : { type: DataTypes.DECIMAL(12,2), allowNull: false },
  wholesale_price : { type: DataTypes.DECIMAL(12,2) },
  tax_inclusive   : { type: DataTypes.BOOLEAN, defaultValue: false },
  tax_rate        : { type: DataTypes.DECIMAL(5,2),  allowNull: true },
  description     : { type: DataTypes.TEXT },
  unit            : { type: DataTypes.STRING(30), defaultValue: 'pcs' },
  brand           : { type: DataTypes.STRING(100) },
  image_url       : { type: DataTypes.STRING(500) },
  stock_quantity  : { type: DataTypes.DECIMAL(12,3), allowNull: false, defaultValue: 0 },
  stock_alert_qty : { type: DataTypes.DECIMAL(12,3), defaultValue: 5 },
  reorder_qty     : { type: DataTypes.DECIMAL(12,3), defaultValue: 10 },
  is_stock_managed: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_active       : { type: DataTypes.BOOLEAN, defaultValue: true },
  is_featured     : { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Product;
