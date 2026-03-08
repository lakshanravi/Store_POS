const { Product, StockMovement } = require('../models');
const { sequelize } = require('../config/database');

// Deduct stock for multiple items in one transaction
async function deductStock(items, saleId, userId, transaction) {
  for (const item of items) {
    const product = await Product.findByPk(item.product_id, { transaction, lock: true });
    if (!product) throw new Error(`Product ID ${item.product_id} not found`);
    if (product.is_stock_managed && product.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock_quantity}`);
    }

    const before = parseFloat(product.stock_quantity);
    const after  = before - parseFloat(item.quantity);

    await product.update({ stock_quantity: after }, { transaction });
    await StockMovement.create({
      product_id     : product.id,
      movement_type  : 'sale',
      reference_id   : saleId,
      reference_type : 'sale',
      quantity_before: before,
      quantity_change: -parseFloat(item.quantity),
      quantity_after : after,
      unit_cost      : item.cost_price,
      performed_by   : userId,
    }, { transaction });
  }
}

// Restore stock on refund
async function restoreStock(items, refundId, userId, transaction) {
  for (const item of items) {
    if (!item.restock) continue;

    const product = await Product.findByPk(item.product_id, { transaction, lock: true });
    if (!product) continue;

    const before = parseFloat(product.stock_quantity);
    const after  = before + parseFloat(item.quantity);

    await product.update({ stock_quantity: after }, { transaction });
    await StockMovement.create({
      product_id     : product.id,
      movement_type  : 'refund',
      reference_id   : refundId,
      reference_type : 'refund',
      quantity_before: before,
      quantity_change: parseFloat(item.quantity),
      quantity_after : after,
      performed_by   : userId,
    }, { transaction });
  }
}

// Get low stock products
async function getLowStockProducts() {
  const { Op } = require('sequelize');
  return Product.findAll({
    where: {
      is_active       : true,
      is_stock_managed: true,
      stock_quantity  : { [Op.lte]: sequelize.col('stock_alert_qty') },
    },
    order: [['stock_quantity', 'ASC']],
  });
}

module.exports = { deductStock, restoreStock, getLowStockProducts };
