// models/Part.js – Parts inventory model
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Part = sequelize.define('Part', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, defaultValue: 0 },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Part;
