// config/database.js – Sequelize configuration
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../data/repair_order.sqlite'),
  logging: false
});

module.exports = { sequelize };
