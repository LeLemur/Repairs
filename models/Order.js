// models/Order.js – Order model with repair order number, state, discount, payment status, and history
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Customer = require('./Customer');

const Order = sequelize.define('Order', {
  repairOrderNumber: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false, defaultValue: 'DEFAULT' },
  discount: { type: DataTypes.FLOAT, defaultValue: 0 },
  paid: { type: DataTypes.BOOLEAN, defaultValue: false },
  history: { type: DataTypes.TEXT, allowNull: true }, // We'll store JSON array as string
}, {
  timestamps: true
});

// Association: Order belongs to Customer
Order.belongsTo(Customer, { foreignKey: 'customerId' });

module.exports = Order;
