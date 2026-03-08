const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// GET /api/reports/daily?date=2026-03-06
async function dailySales(req, res, next) {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const [summary] = await sequelize.query(`
      SELECT
        COUNT(*)                              AS total_transactions,
        COALESCE(SUM(subtotal), 0)            AS gross_revenue,
        COALESCE(SUM(discount_amount), 0)     AS total_discounts,
        COALESCE(SUM(tax_amount), 0)          AS total_tax,
        COALESCE(SUM(total_amount), 0)        AS net_revenue,
        SUM(CASE WHEN status='voided' THEN 1 ELSE 0 END) AS void_count
      FROM sales
      WHERE DATE(sale_date) = :date AND status != 'voided'
    `, { replacements: { date }, type: QueryTypes.SELECT });

    const payments = await sequelize.query(`
      SELECT pm.name, pm.type, COALESCE(SUM(sp.amount),0) AS total
      FROM sale_payments sp
      JOIN sales s ON s.id = sp.sale_id
      JOIN payment_methods pm ON pm.id = sp.payment_method_id
      WHERE DATE(s.sale_date) = :date AND s.status != 'voided'
      GROUP BY pm.id, pm.name, pm.type
    `, { replacements: { date }, type: QueryTypes.SELECT });

    const topProducts = await sequelize.query(`
      SELECT si.product_name, SUM(si.quantity) AS qty_sold, SUM(si.line_total) AS revenue
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      WHERE DATE(s.sale_date) = :date AND s.status != 'voided'
      GROUP BY si.product_id, si.product_name
      ORDER BY qty_sold DESC
      LIMIT 10
    `, { replacements: { date }, type: QueryTypes.SELECT });

    res.json({ success: true, data: { date, summary: summary[0] || summary, payments, top_products: topProducts } });
  } catch (err) { next(err); }
}

// GET /api/reports/profit-loss?from=2026-01-01&to=2026-03-31
async function profitLoss(req, res, next) {
  try {
    const from = req.query.from || new Date().toISOString().split('T')[0];
    const to   = req.query.to   || from;

    const [revenue] = await sequelize.query(`
      SELECT
        COUNT(*)                          AS total_sales,
        COALESCE(SUM(s.subtotal),0)       AS gross_revenue,
        COALESCE(SUM(s.discount_amount),0)AS total_discounts,
        COALESCE(SUM(s.tax_amount),0)     AS total_tax,
        COALESCE(SUM(s.total_amount),0)   AS net_revenue,
        COALESCE(SUM(si.cost_price * si.quantity),0) AS cogs
      FROM sales s
      JOIN sale_items si ON si.sale_id = s.id
      WHERE DATE(s.sale_date) BETWEEN :from AND :to AND s.status = 'completed'
    `, { replacements: { from, to }, type: QueryTypes.SELECT });

    const [refunds] = await sequelize.query(`
      SELECT COUNT(*) AS refund_count, COALESCE(SUM(total_refunded),0) AS total_refunded
      FROM refunds
      WHERE DATE(refunded_at) BETWEEN :from AND :to AND status = 'completed'
    `, { replacements: { from, to }, type: QueryTypes.SELECT });

    const row  = revenue[0] || revenue;
    const rrow = refunds[0] || refunds;
    const gross_profit = parseFloat(row.net_revenue) - parseFloat(row.cogs) - parseFloat(rrow.total_refunded);

    res.json({ success: true, data: { period: { from, to }, revenue: row, refunds: rrow, gross_profit: gross_profit.toFixed(2) } });
  } catch (err) { next(err); }
}

// GET /api/reports/refunds?from=...&to=...
async function refundLog(req, res, next) {
  try {
    const from = req.query.from || new Date().toISOString().split('T')[0];
    const to   = req.query.to   || from;

    const refunds = await sequelize.query(`
      SELECT r.refund_number, r.refunded_at, r.refund_method,
             r.total_refunded, r.reason, r.status,
             s.invoice_number,
             u.full_name AS cashier_name
      FROM refunds r
      JOIN sales s ON s.id = r.sale_id
      JOIN users u ON u.id = r.cashier_id
      WHERE DATE(r.refunded_at) BETWEEN :from AND :to
      ORDER BY r.refunded_at DESC
    `, { replacements: { from, to }, type: QueryTypes.SELECT });

    res.json({ success: true, data: { period: { from, to }, refunds } });
  } catch (err) { next(err); }
}

module.exports = { dailySales, profitLoss, refundLog };
