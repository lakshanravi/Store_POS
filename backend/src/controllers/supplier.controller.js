const { validationResult } = require('express-validator');
const { Supplier } = require('../models');

async function getAll(req, res, next) {
  try {
    const suppliers = await Supplier.findAll({ where: { is_active: true }, order: [['name','ASC']] });
    res.json({ success: true, data: { suppliers } });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const s = await Supplier.findByPk(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: { supplier: s } });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, message: 'Supplier created', data: { supplier } });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const s = await Supplier.findByPk(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Supplier not found' });
    await s.update(req.body);
    res.json({ success: true, message: 'Supplier updated', data: { supplier: s } });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const s = await Supplier.findByPk(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Supplier not found' });
    await s.update({ is_active: false });
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, update, remove };
