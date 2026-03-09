const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StockMovement = sequelize.define(
  "stock_movements",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    movement_type: {
      type: DataTypes.ENUM(
        "purchase",
        "sale",
        "refund",
        "adjustment",
        "damage",
        "transfer",
      ),
      allowNull: false,
    },
    reference_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    reference_type: { type: DataTypes.STRING(30), allowNull: true },
    quantity_before: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    quantity_change: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    quantity_after: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    unit_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    notes: { type: DataTypes.TEXT },
    performed_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  { timestamps: true, updatedAt: false },
);

module.exports = StockMovement;
