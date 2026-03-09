require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const { Role, User, PaymentMethod } = require('../src/models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log('✅ Connected');

    // Roles
    const roleDefs = [
      { name: 'admin',   permissions: { sales:true, products:true, reports:true, settings:true, users:true, inventory:true } },
      { name: 'manager', permissions: { sales:true, products:true, reports:true, settings:false, users:false, inventory:true } },
      { name: 'cashier', permissions: { sales:true, products:false, reports:false, settings:false, users:false, inventory:false } },
    ];
    for (const r of roleDefs) await Role.findOrCreate({ where: { name: r.name }, defaults: r });
    console.log('✅ Roles seeded');

    // Admin user
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        role_id: adminRole.id, full_name: 'System Admin',
        username: 'admin', email: 'admin@store.com',
        password_hash: await bcrypt.hash('Admin@1234', 12), is_active: true,
      },
    });

    // Cashier user
    const cashierRole = await Role.findOne({ where: { name: 'cashier' } });
    await User.findOrCreate({
      where: { username: 'cashier1' },
      defaults: {
        role_id: cashierRole.id, full_name: 'Default Cashier',
        username: 'cashier1', email: 'cashier1@store.com',
        password_hash: await bcrypt.hash('Cashier@1234', 12),
        pin_hash: await bcrypt.hash('1234', 12), is_active: true,
      },
    });
    console.log('✅ Users seeded');

    // Payment methods
    const methods = [
      { name: 'Cash',        type: 'cash',    sort_order: 1 },
      { name: 'Credit Card', type: 'card',    sort_order: 2 },
      { name: 'Debit Card',  type: 'card',    sort_order: 3 },
      { name: 'QR / Mobile', type: 'digital', sort_order: 4 },
      { name: 'Store Credit',type: 'credit',  sort_order: 5 },
    ];
    for (const m of methods) await PaymentMethod.findOrCreate({ where: { name: m.name }, defaults: m });
    console.log('✅ Payment methods seeded');

    console.log('\n🎉 Done!');
    console.log('   admin    → password: Admin@1234');
    console.log('   cashier1 → password: Cashier@1234  PIN: 1234');
    process.exit(0);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
}

seed();
