const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Product, Category, Supplier } = require('../models');

const include = [
  { model: Category, as: 'category', attributes: ['id','name','color_hex'] },
  { model: Supplier, as: 'supplier', attributes: ['id','name'] },
];

// GET /api/products
async function getAll(req, res, next) {
  try {
    const { search, category_id, low_stock, page = 1, limit = 20 } = req.query;
    const where = { is_active: true };

    if (search) {
      where[Op.or] = [
        { name    : { [Op.like]: `%${search}%` } },
        { barcode : { [Op.like]: `%${search}%` } },
        { sku     : { [Op.like]: `%${search}%` } },
      ];
    }
    if (category_id) where.category_id = category_id;
    if (low_stock === 'true') {
      where.is_stock_managed = true;
      where[Op.and] = [{ stock_quantity: { [Op.lte]: require('sequelize').col('stock_alert_qty') } }];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Product.findAndCountAll({
      where, include, limit: parseInt(limit), offset, order: [['name','ASC']],
    });

    res.json({ success: true, data: { products: rows, total: count, page: parseInt(page) } });
  } catch (err) { next(err); }
}

// GET /api/products/:id
async function getOne(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id, { include });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: { product } });
  } catch (err) { next(err); }
}

// GET /api/products/barcode/:code
async function getByBarcode(req, res, next) {
  try {
    const product = await Product.findOne({
      where: { barcode: req.params.code, is_active: true }, include,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: { product } });
  } catch (err) { next(err); }
}

// POST /api/products
async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const slug = req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const product = await Product.create({ ...req.body, slug });
    res.status(201).json({ success: true, message: 'Product created', data: { product } });
  } catch (err) { next(err); }
}

// PUT /api/products/:id
async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.update(req.body);
    res.json({ success: true, message: 'Product updated', data: { product } });
  } catch (err) { next(err); }
}

// DELETE /api/products/:id  (soft delete)
async function remove(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await product.update({ is_active: false });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, getByBarcode, create, update, remove };
