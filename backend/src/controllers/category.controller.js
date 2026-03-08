const { validationResult } = require('express-validator');
const { Category } = require('../models');

async function getAll(req, res, next) {
  try {
    const categories = await Category.findAll({
      where: { is_active: true, parent_id: null },
      include: [{ model: Category, as: 'children' }],
      order: [['sort_order','ASC'],['name','ASC']],
    });
    res.json({ success: true, data: { categories } });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const cat = await Category.findByPk(req.params.id, {
      include: [{ model: Category, as: 'children' }],
    });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: { category: cat } });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const slug = req.body.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') + '-' + Date.now();
    const category = await Category.create({ ...req.body, slug });
    res.status(201).json({ success: true, message: 'Category created', data: { category } });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    await cat.update(req.body);
    res.json({ success: true, message: 'Category updated', data: { category: cat } });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    await cat.update({ is_active: false });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, update, remove };
