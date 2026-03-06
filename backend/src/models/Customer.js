const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('customers', {
  id            : { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name          : { type: DataTypes.STRING(150), allowNull: false },
  phone         : { type: DataTypes.STRING(30),  unique: true },
  email         : { type: DataTypes.STRING(150), unique: true },
  address       : { type: DataTypes.TEXT },
  city          : { type: DataTypes.STRING(80) },
  loyalty_points: { type: DataTypes.INTEGER,      defaultValue: 0 },
  total_spent   : { type: DataTypes.DECIMAL(14,2),defaultValue: 0.00 },
  notes         : { type: DataTypes.TEXT },
  is_active     : { type: DataTypes.BOOLEAN,      defaultValue: true },
});

module.exports = Customer;
