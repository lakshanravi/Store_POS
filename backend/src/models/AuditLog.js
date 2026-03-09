const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('audit_logs', {
  id          : { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id     : { type: DataTypes.INTEGER.UNSIGNED },
  action      : { type: DataTypes.STRING(50), allowNull: false },
  entity_type : { type: DataTypes.STRING(50) },
  entity_id   : { type: DataTypes.INTEGER.UNSIGNED },
  old_values  : { type: DataTypes.JSON },
  new_values  : { type: DataTypes.JSON },
  ip_address  : { type: DataTypes.STRING(45) },
}, { timestamps: true, updatedAt: false });

module.exports = AuditLog;
