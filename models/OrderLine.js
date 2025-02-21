// models/OrderLine.js – Order line items
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Order = require('./Order');
const Part = require('./Part');

const OrderLine = sequelize.define('OrderLine', {
  description: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  price: { type: DataTypes.FLOAT, defaultValue: 0 }
}, {
  timestamps: true
});

// Association: OrderLine belongs to Order and may reference a Part
OrderLine.belongsTo(Order, { foreignKey: 'orderId' });
OrderLine.belongsTo(Part, { foreignKey: 'partId' });

module.exports = OrderLine;
