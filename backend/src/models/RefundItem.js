const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const RefundItem = sequelize.define(
  "refund_items",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    refund_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    sale_item_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    quantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    refund_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    restock: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { timestamps: false },
);

module.exports = RefundItem;
