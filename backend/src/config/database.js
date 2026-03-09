const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host    : process.env.DB_HOST || 'localhost',
    port    : parseInt(process.env.DB_PORT) || 3306,
    dialect : 'mysql',
    logging : process.env.NODE_ENV === 'development' ? console.log : false,
    pool    : { max: 10, min: 2, acquire: 30000, idle: 10000 },
    dialectOptions : { timezone: '+05:30' },
    define  : {
      underscored    : true,
      freezeTableName: true,
      timestamps     : true,
      createdAt      : 'created_at',
      updatedAt      : 'updated_at',
    },
  }
);

module.exports = { sequelize };
