const { Product, StockMovement, User } = require('../models');
const { getLowStockProducts } = require('../services/stock.service');

async function getStock(req, res, next) {
  try {
    const products = await Product.findAll({
      where: { is_active: true },
      attributes: ['id','name','sku','barcode','stock_quantity','stock_alert_qty','unit','is_stock_managed'],
      order: [['name','ASC']],
    });
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
}

async function getLowStock(req, res, next) {
  try {
    const products = await getLowStockProducts();
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
}

async function getMovements(req, res, next) {
  try {
    const { product_id, page = 1, limit = 50 } = req.query;
    const where = product_id ? { product_id } : {};
    const offset = (parseInt(page)-1) * parseInt(limit);
    const { count, rows } = await StockMovement.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id','name'] },
        { model: User,    as: 'performer', attributes: ['id','full_name'] },
      ],
      limit: parseInt(limit), offset,
      order: [['created_at','DESC']],
    });
    res.json({ success: true, data: { movements: rows, total: count } });
  } catch (err) { next(err); }
}

async function adjust(req, res, next) {
  try {
    const { product_id, quantity_change, notes } = req.body;
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const before = parseFloat(product.stock_quantity);
    const after  = before + parseFloat(quantity_change);
    if (after < 0) return res.status(400).json({ success: false, message: 'Stock cannot go below 0' });

    await product.update({ stock_quantity: after });
    await StockMovement.create({
      product_id, movement_type: 'adjustment',
      quantity_before: before, quantity_change: parseFloat(quantity_change), quantity_after: after,
      notes, performed_by: req.user.id,
    });
    res.json({ success: true, message: 'Stock adjusted', data: { product } });
  } catch (err) { next(err); }
}

module.exports = { getStock, getLowStock, getMovements, adjust };
