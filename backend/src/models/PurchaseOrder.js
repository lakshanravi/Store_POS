const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseOrder = sequelize.define('purchase_orders', {
  id          : { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  po_number   : { type: DataTypes.STRING(30), allowNull: false, unique: true },
  supplier_id : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  created_by  : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  status      : { type: DataTypes.ENUM('draft','ordered','received','partial','cancelled'), defaultValue: 'draft' },
  subtotal    : { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  tax_amount  : { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  total_amount: { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  notes       : { type: DataTypes.TEXT },
  ordered_at  : { type: DataTypes.DATE },
  expected_at : { type: DataTypes.DATE },
  received_at : { type: DataTypes.DATE },
}, { timestamps: true });

module.exports = PurchaseOrder;
