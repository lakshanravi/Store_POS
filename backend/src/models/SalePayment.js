const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SalePayment = sequelize.define(
  "sale_payments",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    sale_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    payment_method_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    reference_number: { type: DataTypes.STRING(100) },
    paid_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false },
);

module.exports = SalePayment;
