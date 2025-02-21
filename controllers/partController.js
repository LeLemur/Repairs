// controllers/partController.js – Manage parts with autocomplete, stock updates, etc.
const Part = require('../models/Part');

exports.getAllParts = async (req, res, next) => {
  try {
    const query = req.query.query;
    if (query) {
      const parts = await Part.findAll({ where: { name: { [require('sequelize').Op.like]: `%${query}%` } } });
      return res.json(parts);
    }
    const parts = await Part.findAll();
    res.json(parts);
  } catch (err) {
    next(err);
  }
};

exports.createPart = async (req, res, next) => {
  try {
    const { name, price, stock } = req.body;
    if (!name) return res.status(400).json({ error: 'Part name is required' });
    const part = await Part.create({ name, price: price || 0, stock: stock || 0 });
    res.status(201).json(part);
  } catch (err) {
    next(err);
  }
};

exports.updatePart = async (req, res, next) => {
  try {
    const { name, price, stock } = req.body;
    const part = await Part.findByPk(req.params.id);
    if (!part) return res.status(404).json({ error: 'Part not found' });
    await part.update({ name, price, stock });
    res.json(part);
  } catch (err) {
    next(err);
  }
};

exports.deletePart = async (req, res, next) => {
  try {
    const part = await Part.findByPk(req.params.id);
    if (!part) return res.status(404).json({ error: 'Part not found' });
    await part.destroy();
    res.json({ message: 'Part deleted' });
  } catch (err) {
    next(err);
  }
};
