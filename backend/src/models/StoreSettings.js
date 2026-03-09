const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StoreSettings = sequelize.define('store_settings', {
  id           : { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  store_name   : { type: DataTypes.STRING(150), allowNull: false, defaultValue: 'My Store' },
  address      : { type: DataTypes.TEXT },
  phone        : { type: DataTypes.STRING(30) },
  email        : { type: DataTypes.STRING(150) },
  currency_symbol: { type: DataTypes.STRING(10), defaultValue: 'Rs.' },
  tax_rate     : { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  tax_label    : { type: DataTypes.STRING(20), defaultValue: 'VAT' },
  receipt_footer: { type: DataTypes.TEXT },
  logo_url     : { type: DataTypes.STRING(500) },
}, { timestamps: true });

module.exports = StoreSettings;
