const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Supplier = sequelize.define('suppliers', {
  id           : { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name         : { type: DataTypes.STRING(150), allowNull: false },
  contact_name : { type: DataTypes.STRING(100) },
  phone        : { type: DataTypes.STRING(30) },
  email        : { type: DataTypes.STRING(150) },
  address      : { type: DataTypes.TEXT },
  city         : { type: DataTypes.STRING(80) },
  country      : { type: DataTypes.STRING(80), defaultValue: 'Sri Lanka' },
  tax_id       : { type: DataTypes.STRING(50) },
  payment_terms: { type: DataTypes.STRING(100) },
  notes        : { type: DataTypes.TEXT },
  is_active    : { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Supplier;
