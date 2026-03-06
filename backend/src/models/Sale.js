const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('sales', {
  id             : { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  invoice_number : { type: DataTypes.STRING(30), allowNull: false, unique: true },
  cashier_id     : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  customer_id    : { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  subtotal       : { type: DataTypes.DECIMAL(14,2), allowNull: false },
  discount_type  : { type: DataTypes.ENUM('percentage','fixed'), allowNull: true },
  discount_value : { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  discount_amount: { type: DataTypes.DECIMAL(14,2), defaultValue: 0.00 },
  taxable_amount : { type: DataTypes.DECIMAL(14,2), defaultValue: 0.00 },
  tax_rate       : { type: DataTypes.DECIMAL(5,2),  defaultValue: 0.00 },
  tax_amount     : { type: DataTypes.DECIMAL(14,2), defaultValue: 0.00 },
  total_amount   : { type: DataTypes.DECIMAL(14,2), allowNull: false },
  amount_tendered: { type: DataTypes.DECIMAL(14,2), defaultValue: 0.00 },
  change_amount  : { type: DataTypes.DECIMAL(14,2), defaultValue: 0.00 },
  notes          : { type: DataTypes.TEXT },
  status         : {
    type: DataTypes.ENUM('completed','voided','refunded','partial_refund'),
    defaultValue: 'completed',
  },
  sale_date      : { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Sale;
