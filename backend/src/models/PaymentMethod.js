const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PaymentMethod = sequelize.define(
  "payment_methods",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    type: {
      type: DataTypes.ENUM("cash", "card", "digital", "credit", "other"),
      defaultValue: "other",
    },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { timestamps: true, updatedAt: false },
);

module.exports = PaymentMethod;
