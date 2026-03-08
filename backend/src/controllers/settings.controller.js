const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

async function get(req, res, next) {
  try {
    const [settings] = await sequelize.query(
      'SELECT * FROM store_settings LIMIT 1', { type: QueryTypes.SELECT }
    );
    res.json({ success: true, data: { settings: settings || {} } });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const fields = ['store_name','address','phone','email','currency_code',
                    'currency_symbol','tax_rate','tax_label','receipt_footer'];
    const updates = fields.filter(f => req.body[f] !== undefined)
                          .map(f => `${f} = :${f}`).join(', ');
    if (!updates) return res.status(400).json({ success: false, message: 'Nothing to update' });

    await sequelize.query(
      `UPDATE store_settings SET ${updates} WHERE id = 1`,
      { replacements: req.body, type: QueryTypes.UPDATE }
    );
    res.json({ success: true, message: 'Settings updated' });
  } catch (err) { next(err); }
}

module.exports = { get, update };
