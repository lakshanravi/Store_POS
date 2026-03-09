const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SaleItem = sequelize.define(
  "sale_items",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    sale_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    product_name: { type: DataTypes.STRING(200), allowNull: false }, // snapshot
    barcode: { type: DataTypes.STRING(100) },
    unit: { type: DataTypes.STRING(30) },
    quantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    cost_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    discount_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.0 },
    tax_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    line_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  },
  { timestamps: false },
);

module.exports = SaleItem;
