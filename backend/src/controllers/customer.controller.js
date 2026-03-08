const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Customer } = require('../models');

async function getAll(req, res, next) {
  try {
    const { search } = req.query;
    const where = { is_active: true };
    if (search) {
      where[Op.or] = [
        { name  : { [Op.like]: `%${search}%` } },
        { phone : { [Op.like]: `%${search}%` } },
        { email : { [Op.like]: `%${search}%` } },
      ];
    }
    const customers = await Customer.findAll({ where, order: [['name','ASC']] });
    res.json({ success: true, data: { customers } });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const c = await Customer.findByPk(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: { customer: c } });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, message: 'Customer created', data: { customer } });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const c = await Customer.findByPk(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Customer not found' });
    await c.update(req.body);
    res.json({ success: true, message: 'Customer updated', data: { customer: c } });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const c = await Customer.findByPk(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Customer not found' });
    await c.update({ is_active: false });
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, update, remove };
