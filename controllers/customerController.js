// controllers/customerController.js – CRUD for customers with robust contact info
const Customer = require('../models/Customer');

exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (err) {
    next(err);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address, contactNotes } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    const customer = await Customer.create({ name, email, phone, address, contactNotes });
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address, contactNotes } = req.body;
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    await customer.update({ name, email, phone, address, contactNotes });
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    await customer.destroy();
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
};
