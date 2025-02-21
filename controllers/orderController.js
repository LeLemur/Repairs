// controllers/orderController.js – Order and order-line management with totals, history, state, payment, etc.
const Order = require('../models/Order');
const OrderLine = require('../models/OrderLine');
const Customer = require('../models/Customer');
const Part = require('../models/Part');
const { calculateTaxForState } = require('../utils/taxCalculator');

// Helper: append a history record
async function appendHistory(order, message) {
  let history = [];
  if (order.history) {
    try { history = JSON.parse(order.history); } catch (e) { history = []; }
  }
  history.push(message);
  await order.update({ history: JSON.stringify(history) });
}

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({ include: [Customer] });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: [Customer, OrderLine] });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { repairOrderNumber, customerId, state } = req.body;
    if (!customerId) return res.status(400).json({ error: 'Customer is required' });
    const customer = await Customer.findByPk(customerId);
    if (!customer) return res.status(400).json({ error: 'Invalid customer' });
    const now = new Date().toISOString();
    const order = await Order.create({
      repairOrderNumber: repairOrderNumber || `RO-${Date.now()}`,
      customerId,
      state: state || 'DEFAULT',
      history: JSON.stringify([`Order created at ${new Date().toLocaleString()}`]),
      createdAt: now,
      updatedAt: now
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const { repairOrderNumber, customerId, state, discount, paid } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await order.update({ repairOrderNumber, customerId, state, discount, paid });
    await appendHistory(order, `Order updated at ${new Date().toLocaleString()}`);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await order.destroy();
    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};

exports.addOrderLine = async (req, res, next) => {
  try {
    const { description, partId, quantity, price } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const line = await OrderLine.create({
      orderId: order.id,
      description,
      partId: partId || null,
      quantity: quantity || 1,
      price: price || 0
    });
    await appendHistory(order, `Line added at ${new Date().toLocaleString()}`);
    res.status(201).json(line);
  } catch (err) {
    next(err);
  }
};

exports.updateOrderLine = async (req, res, next) => {
  try {
    const { description, partId, quantity, price } = req.body;
    const line = await OrderLine.findOne({ where: { id: req.params.lineId, orderId: req.params.id } });
    if (!line) return res.status(404).json({ error: 'Line not found' });
    await line.update({ description, partId, quantity, price });
    const order = await Order.findByPk(req.params.id);
    await appendHistory(order, `Line ${req.params.lineId} updated at ${new Date().toLocaleString()}`);
    res.json(line);
  } catch (err) {
    next(err);
  }
};

exports.deleteOrderLine = async (req, res, next) => {
  try {
    const line = await OrderLine.findOne({ where: { id: req.params.lineId, orderId: req.params.id } });
    if (!line) return res.status(404).json({ error: 'Line not found' });
    await line.destroy();
    const order = await Order.findByPk(req.params.id);
    await appendHistory(order, `Line ${req.params.lineId} deleted at ${new Date().toLocaleString()}`);
    res.json({ message: 'Line deleted' });
  } catch (err) {
    next(err);
  }
};

// New functionality: calculate totals (subtotal, tax, total)
exports.calculateOrderTotal = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: [OrderLine] });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    let subTotal = order.OrderLines.reduce((sum, line) => sum + (line.quantity * line.price), 0);
    subTotal -= order.discount || 0;
    const taxRate = calculateTaxForState(order.state);
    const tax = subTotal * taxRate;
    const total = subTotal + tax;
    res.json({ subTotal, tax, total });
  } catch (err) {
    next(err);
  }
};

// Additional endpoints: search orders, list by date range, mark as paid, get history, etc.
exports.searchOrders = async (req, res, next) => {
  try {
    const { repairOrderNumber } = req.query;
    const orders = await Order.findAll({ where: { repairOrderNumber: { [require('sequelize').Op.like]: `%${repairOrderNumber}%` } }, include: [Customer] });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.listOrdersByDateRange = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const orders = await Order.findAll({
      where: {
        createdAt: {
          [require('sequelize').Op.between]: [start, end]
        }
      },
      include: [Customer]
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getOrderHistory = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    let history = [];
    if (order.history) {
      try { history = JSON.parse(order.history); } catch (e) { history = []; }
    }
    res.json(history);
  } catch (err) {
    next(err);
  }
};

exports.markOrderAsPaid = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await order.update({ paid: true });
    await appendHistory(order, `Order marked as paid at ${new Date().toLocaleString()}`);
    res.json({ message: 'Order marked as paid' });
  } catch (err) {
    next(err);
  }
};
