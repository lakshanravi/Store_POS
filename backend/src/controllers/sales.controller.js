const { validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const { Sale, SaleItem, SalePayment, Customer, User } = require('../models');
const { generateInvoiceNumber } = require('../services/invoice.service');
const { deductStock } = require('../services/stock.service');

// GET /api/sales
async function getAll(req, res, next) {
  try {
    const { page = 1, limit = 20, status, date_from, date_to } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    if (status) where.status = status;
    if (date_from || date_to) {
      where.sale_date = {};
      if (date_from) where.sale_date[Op.gte] = new Date(date_from);
      if (date_to)   where.sale_date[Op.lte] = new Date(date_to + 'T23:59:59');
    }
    const offset = (parseInt(page)-1) * parseInt(limit);
    const { count, rows } = await Sale.findAndCountAll({
      where,
      include: [
        { model: User,     as: 'cashier',  attributes: ['id','full_name'] },
        { model: Customer, as: 'customer', attributes: ['id','name','phone'] },
      ],
      limit: parseInt(limit), offset,
      order: [['sale_date','DESC']],
    });
    res.json({ success: true, data: { sales: rows, total: count } });
  } catch (err) { next(err); }
}

// GET /api/sales/:id
async function getOne(req, res, next) {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        { model: User,        as: 'cashier',  attributes: ['id','full_name'] },
        { model: Customer,    as: 'customer' },
        { model: SaleItem,    as: 'items' },
        { model: SalePayment, as: 'payments',
          include: [{ association: 'method', attributes: ['id','name','type'] }] },
      ],
    });
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, data: { sale } });
  } catch (err) { next(err); }
}

// POST /api/sales  — ATOMIC transaction
async function create(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { await t.rollback(); return res.status(422).json({ success: false, errors: errors.array() }); }

    const { items, payments, customer_id, discount_type, discount_value,
            tax_rate, amount_tendered, notes } = req.body;

    // Calculate totals
    const subtotal        = items.reduce((s, i) => s + (i.unit_price * i.quantity), 0);
    const discount_amount = discount_type === 'percentage'
      ? (subtotal * discount_value / 100)
      : (discount_value || 0);
    const taxable_amount  = subtotal - discount_amount;
    const tax_amount      = ((tax_rate || 0) / 100) * taxable_amount;
    const total_amount    = taxable_amount + tax_amount;
    const change_amount   = Math.max(0, (amount_tendered || 0) - total_amount);

    const invoice_number = await generateInvoiceNumber();

    const sale = await Sale.create({
      invoice_number, cashier_id: req.user.id, customer_id: customer_id || null,
      subtotal, discount_type, discount_value: discount_value || 0, discount_amount,
      taxable_amount, tax_rate: tax_rate || 0, tax_amount, total_amount,
      amount_tendered: amount_tendered || 0, change_amount, notes, status: 'completed',
    }, { transaction: t });

    // Line items
    const saleItems = items.map(i => ({
      sale_id: sale.id, product_id: i.product_id, product_name: i.product_name,
      barcode: i.barcode, unit: i.unit, quantity: i.quantity,
      cost_price: i.cost_price, unit_price: i.unit_price,
      discount_amount: i.discount_amount || 0,
      tax_rate: i.tax_rate || 0, tax_amount: i.tax_amount || 0,
      line_total: (i.unit_price - (i.discount_amount || 0)) * i.quantity,
    }));
    await SaleItem.bulkCreate(saleItems, { transaction: t });

    // Payments
    const salePayments = payments.map(p => ({
      sale_id: sale.id, payment_method_id: p.payment_method_id, amount: p.amount,
      reference_number: p.reference_number || null,
    }));
    await SalePayment.bulkCreate(salePayments, { transaction: t });

    // Deduct stock
    await deductStock(items, sale.id, req.user.id, t);

    // Update customer total_spent
    if (customer_id) {
      await Customer.increment('total_spent', { by: total_amount, where: { id: customer_id }, transaction: t });
    }

    await t.commit();
    res.status(201).json({ success: true, message: 'Sale completed', data: { sale, invoice_number } });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

// PUT /api/sales/:id/void
async function voidSale(req, res, next) {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    if (sale.status !== 'completed') return res.status(400).json({ success: false, message: 'Only completed sales can be voided' });
    await sale.update({ status: 'voided' });
    res.json({ success: true, message: 'Sale voided' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, voidSale };
