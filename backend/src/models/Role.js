const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Role = sequelize.define(
  "roles",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { isIn: [["admin", "manager", "cashier"]] },
    },
    permissions: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
  },
  { timestamps: true, updatedAt: false },
);

module.exports = Role;
