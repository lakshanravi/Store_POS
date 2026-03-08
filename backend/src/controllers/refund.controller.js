const { sequelize } = require('../config/database');
const { Sale, Refund, RefundItem, SaleItem } = require('../models');
const { generateRefundNumber } = require('../services/invoice.service');
const { restoreStock } = require('../services/stock.service');

async function getAll(req, res, next) {
  try {
    const refunds = await Refund.findAll({
      include: [
        { model: Sale, as: 'sale', attributes: ['id','invoice_number'] },
        { association: 'cashier', attributes: ['id','full_name'] },
      ],
      order: [['refunded_at','DESC']],
    });
    res.json({ success: true, data: { refunds } });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const refund = await Refund.findByPk(req.params.id, {
      include: [
        { model: Sale, as: 'sale' },
        { model: RefundItem, as: 'items',
          include: [{ association: 'product', attributes: ['id','name'] }] },
      ],
    });
    if (!refund) return res.status(404).json({ success: false, message: 'Refund not found' });
    res.json({ success: true, data: { refund } });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { sale_id, items, refund_method, reason, notes } = req.body;

    const sale = await Sale.findByPk(sale_id, { transaction: t });
    if (!sale) { await t.rollback(); return res.status(404).json({ success: false, message: 'Sale not found' }); }
    if (sale.status === 'voided') { await t.rollback(); return res.status(400).json({ success: false, message: 'Cannot refund a voided sale' }); }

    const total_refunded  = items.reduce((s, i) => s + (i.unit_price * i.quantity), 0);
    const refund_number   = await generateRefundNumber();

    const refund = await Refund.create({
      sale_id, cashier_id: req.user.id, refund_number, reason,
      refund_method, total_refunded, notes, status: 'completed',
    }, { transaction: t });

    const refundItems = items.map(i => ({
      refund_id: refund.id, sale_item_id: i.sale_item_id,
      product_id: i.product_id, quantity: i.quantity,
      unit_price: i.unit_price, refund_amount: i.unit_price * i.quantity,
      restock: i.restock !== false,
    }));
    await RefundItem.bulkCreate(refundItems, { transaction: t });

    await restoreStock(refundItems, refund.id, req.user.id, t);

    await sale.update({ status: 'refunded' }, { transaction: t });

    await t.commit();
    res.status(201).json({ success: true, message: 'Refund processed', data: { refund } });
  } catch (err) { await t.rollback(); next(err); }
}

module.exports = { getAll, getOne, create };
