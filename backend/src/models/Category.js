const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('categories', {
  id        : { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  parent_id : { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  name      : { type: DataTypes.STRING(100), allowNull: false },
  slug      : { type: DataTypes.STRING(110), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  color_hex : { type: DataTypes.CHAR(7), defaultValue: '#6366f1' },
  icon      : { type: DataTypes.STRING(50) },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active : { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Category;
