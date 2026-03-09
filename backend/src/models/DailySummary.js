const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DailySummary = sequelize.define('daily_summaries', {
  id                 : { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  summary_date       : { type: DataTypes.DATEONLY, allowNull: false, unique: true },
  total_transactions : { type: DataTypes.INTEGER, defaultValue: 0 },
  gross_revenue      : { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  total_discounts    : { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  tax_amount         : { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  net_revenue        : { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  total_refunds      : { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  refund_count       : { type: DataTypes.INTEGER, defaultValue: 0 },
  void_count         : { type: DataTypes.INTEGER, defaultValue: 0 },
  cogs               : { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  gross_profit       : { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
}, { timestamps: true });

module.exports = DailySummary;
