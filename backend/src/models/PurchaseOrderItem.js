const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseOrderItem = sequelize.define('purchase_order_items', {
  id                 : { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  purchase_order_id  : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  product_id         : { type: DataTypes.INTEGER.UNSIGNED },
  product_name       : { type: DataTypes.STRING(200), allowNull: false },
  quantity_ordered   : { type: DataTypes.DECIMAL(12,3), allowNull: false },
  quantity_received  : { type: DataTypes.DECIMAL(12,3), defaultValue: 0 },
  unit_cost          : { type: DataTypes.DECIMAL(12,2), allowNull: false },
  line_total         : { type: DataTypes.DECIMAL(14,2), allowNull: false },
}, { timestamps: true, updatedAt: false });

module.exports = PurchaseOrderItem;
