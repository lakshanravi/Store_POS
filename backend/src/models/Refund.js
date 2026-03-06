const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Refund = sequelize.define('refunds', {
  id             : { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  sale_id        : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  cashier_id     : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  refund_number  : { type: DataTypes.STRING(30), allowNull: false, unique: true },
  reason         : { type: DataTypes.TEXT },
  refund_method  : {
    type: DataTypes.ENUM('cash','card','store_credit','exchange'),
    allowNull: false,
  },
  total_refunded : { type: DataTypes.DECIMAL(14,2), allowNull: false },
  status         : {
    type: DataTypes.ENUM('completed','pending','rejected'),
    defaultValue: 'completed',
  },
  notes          : { type: DataTypes.TEXT },
  refunded_at    : { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Refund;
