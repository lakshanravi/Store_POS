const { Sale, Refund } = require('../models');

// Generates next invoice number: INV-2026-000001
async function generateInvoiceNumber() {
  const year  = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const last = await Sale.findOne({
    where: { invoice_number: { [require('sequelize').Op.like]: `${prefix}%` } },
    order: [['id', 'DESC']],
  });

  const lastNum = last ? parseInt(last.invoice_number.split('-')[2]) : 0;
  const next    = String(lastNum + 1).padStart(6, '0');
  return `${prefix}${next}`;
}

// Generates next refund number: REF-2026-000001
async function generateRefundNumber() {
  const year   = new Date().getFullYear();
  const prefix = `REF-${year}-`;

  const last = await Refund.findOne({
    where: { refund_number: { [require('sequelize').Op.like]: `${prefix}%` } },
    order: [['id', 'DESC']],
  });

  const lastNum = last ? parseInt(last.refund_number.split('-')[2]) : 0;
  const next    = String(lastNum + 1).padStart(6, '0');
  return `${prefix}${next}`;
}

module.exports = { generateInvoiceNumber, generateRefundNumber };
