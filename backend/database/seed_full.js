'use strict';
require('dotenv').config();
const { sequelize } = require('../src/config/database');
const bcrypt = require('bcryptjs');
require('../src/models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    await sequelize.sync({ alter: true });
    console.log('✅ All tables synced');

    const run = (sql) => sequelize.query(sql);

    await run('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of ['audit_logs','daily_summaries','purchase_order_items','purchase_orders',
      'stock_movements','refund_items','refunds','sale_payments','sale_items','sales',
      'customers','payment_methods','products','suppliers','categories','store_settings','users','roles']) {
      try { await run(`TRUNCATE TABLE \`${t}\``); } catch(e) { console.log(`  ⚠️  skip ${t}`); }
    }
    await run('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Tables cleared');

    // ROLES
    await run(`INSERT INTO roles (id,name,permissions,created_at) VALUES
      (1,'admin',   '{"sales":true,"products":true,"reports":true,"settings":true,"users":true,"inventory":true}', NOW()),
      (2,'manager', '{"sales":true,"products":true,"reports":true,"settings":false,"users":false,"inventory":true}', NOW()),
      (3,'cashier', '{"sales":true,"products":false,"reports":false,"settings":false,"users":false,"inventory":false}', NOW())`);
    console.log('✅ Roles');

    // USERS
    const [aH, mH, cH, pinH] = await Promise.all([
      bcrypt.hash('Admin@1234', 12), bcrypt.hash('Manager@1234', 12),
      bcrypt.hash('Cashier@1234', 12), bcrypt.hash('1234', 12)
    ]);
    await run(`INSERT INTO users (id,role_id,full_name,username,email,password_hash,pin_hash,is_active,created_at,updated_at) VALUES
      (1,1,'System Admin',   'admin',   'admin@store.com',   '${aH}', NULL,       1,NOW(),NOW()),
      (2,2,'Store Manager',  'manager', 'manager@store.com', '${mH}', NULL,       1,NOW(),NOW()),
      (3,3,'Default Cashier','cashier1','cashier1@store.com','${cH}', '${pinH}',  1,NOW(),NOW()),
      (4,3,'Sarah Cashier',  'cashier2','cashier2@store.com','${cH}', '${pinH}',  1,NOW(),NOW())`);
    console.log('✅ Users');

    // STORE SETTINGS
    await run(`INSERT INTO store_settings (id,store_name,address,phone,email,currency_symbol,tax_rate,tax_label,receipt_footer,created_at,updated_at) VALUES
      (1,'RetailPOS Store','123 Main Street, Colombo 03','+94 11 234 5678','store@retailpos.lk','Rs.',0.00,'VAT','Thank you for shopping with us!',NOW(),NOW())`);
    console.log('✅ Store Settings');

    // PAYMENT METHODS (no updated_at column)
    await run(`INSERT INTO payment_methods (id,name,type,is_active,sort_order,created_at) VALUES
      (1,'Cash',         'cash',    1,1,NOW()),
      (2,'Visa Card',    'card',    1,2,NOW()),
      (3,'Master Card',  'card',    1,3,NOW()),
      (4,'QR / Mobile',  'digital', 1,4,NOW()),
      (5,'Bank Transfer','other',   1,5,NOW())`);
    console.log('✅ Payment Methods');

    // CATEGORIES (has slug)
    await run(`INSERT INTO categories (id,name,slug,description,color_hex,icon,parent_id,created_at,updated_at) VALUES
      (1, 'Beverages',    'beverages',    'Drinks and beverages',          '#3b82f6','🥤', NULL,NOW(),NOW()),
      (2, 'Snacks',       'snacks',       'Chips, biscuits and snacks',    '#f59e0b','🍿', NULL,NOW(),NOW()),
      (3, 'Dairy',        'dairy',        'Milk, cheese, yoghurt',         '#10b981','🥛', NULL,NOW(),NOW()),
      (4, 'Bakery',       'bakery',       'Bread, cakes and pastries',     '#f97316','🍞', NULL,NOW(),NOW()),
      (5, 'Personal Care','personal-care','Soap, shampoo, toothpaste',     '#8b5cf6','🧴', NULL,NOW(),NOW()),
      (6, 'Cleaning',     'cleaning',     'Household cleaning products',   '#06b6d4','🧹', NULL,NOW(),NOW()),
      (7, 'Stationery',   'stationery',   'Pens, notebooks, office items', '#64748b','✏️', NULL,NOW(),NOW()),
      (8, 'Frozen Foods', 'frozen-foods', 'Ice cream and frozen items',    '#0ea5e9','🧊', NULL,NOW(),NOW()),
      (9, 'Condiments',   'condiments',   'Sauces, spices and seasoning',  '#ef4444','🌶️',NULL,NOW(),NOW()),
      (10,'Electronics',  'electronics',  'Batteries, chargers, cables',   '#6366f1','🔋', NULL,NOW(),NOW())`);
    console.log('✅ Categories');

    // SUPPLIERS
    await run(`INSERT INTO suppliers (id,name,contact_name,phone,email,address,city,payment_terms,notes,is_active,created_at,updated_at) VALUES
      (1,'Ceylon Beverages Ltd',  'Amal Perera',    '+94 11 222 3344','sales@ceylonbev.lk',  '45 Industrial Zone, Ekala',  'Colombo','Net 30','Main beverage supplier',     1,NOW(),NOW()),
      (2,'Lanka Foods Pvt Ltd',   'Nimal Silva',    '+94 11 333 4455','orders@lankafoods.lk','12 Factory Rd, Biyagama',    'Gampaha','Net 15','Snacks and dry goods',       1,NOW(),NOW()),
      (3,'Fresh Dairy Co',        'Kamala Fernando','+94 11 444 5566','fresh@dairyco.lk',    '8 Milk Colony, Ambepussa',   'Kegalle','COD',   'Daily dairy deliveries',     1,NOW(),NOW()),
      (4,'Island Bakers',         'Ruwan Jayasena', '+94 11 555 6677','info@islandbakers.lk','22 Bakery Lane, Nugegoda',   'Colombo','COD',   'Fresh bread and pastries',   1,NOW(),NOW()),
      (5,'Unilever Lanka',        'Dilshan Ratna',  '+94 11 666 7788','trade@unilever.lk',   '1 HPC Building, Grandpass',  'Colombo','Net 45','Personal care and cleaning', 1,NOW(),NOW()),
      (6,'Hemas Holdings',        'Priya Wickrama', '+94 11 777 8899','sales@hemas.lk',      '75 Braybrooke Pl',           'Colombo','Net 30','FMCG products',              1,NOW(),NOW()),
      (7,'MAS Imports',           'Tharaka Mendis', '+94 11 888 9900','imports@mas.lk',      '100 Export Zone, Katunayake','Gampaha','Net 60','Electronics accessories',    1,NOW(),NOW())`);
    console.log('✅ Suppliers');

    // PRODUCTS (has slug)
    await run(`INSERT INTO products (id,category_id,supplier_id,name,slug,barcode,sku,description,cost_price,selling_price,tax_rate,unit,stock_quantity,stock_alert_qty,is_stock_managed,is_active,created_at,updated_at) VALUES
      (1, 1,1,'Coca-Cola 330ml',          'coca-cola-330ml',          '5000112637922','BEV-001','Classic Coca-Cola can',         60.00, 95.00,0,'can',   150,20,1,1,NOW(),NOW()),
      (2, 1,1,'Pepsi 330ml',              'pepsi-330ml',              '5000112637923','BEV-002','Pepsi cola can',                58.00, 90.00,0,'can',   120,20,1,1,NOW(),NOW()),
      (3, 1,1,'Water Bottle 500ml',       'water-bottle-500ml',       '5000112637924','BEV-003','Pure drinking water',           15.00, 35.00,0,'bottle',200,50,1,1,NOW(),NOW()),
      (4, 1,1,'Orange Juice 1L',          'orange-juice-1l',          '5000112637925','BEV-004','Fresh orange juice',           120.00,195.00,0,'bottle', 80,15,1,1,NOW(),NOW()),
      (5, 1,1,'Milo 200ml',               'milo-200ml',               '5000112637926','BEV-005','Nestle Milo drink',             55.00, 85.00,0,'pack',  100,20,1,1,NOW(),NOW()),
      (6, 2,2,'Lays Classic Chips 100g',  'lays-classic-chips-100g',  '5000112637927','SNK-001','Potato chips classic',          75.00,120.00,0,'pack',   90,15,1,1,NOW(),NOW()),
      (7, 2,2,'Marie Biscuits 200g',      'marie-biscuits-200g',      '5000112637928','SNK-002','Marie tea biscuits',            45.00, 75.00,0,'pack',   80,10,1,1,NOW(),NOW()),
      (8, 2,2,'Chocolate Bar 50g',        'chocolate-bar-50g',        '5000112637929','SNK-003','Milk chocolate bar',            60.00,100.00,0,'bar',   150,25,1,1,NOW(),NOW()),
      (9, 2,2,'Peanuts 150g',             'peanuts-150g',             '5000112637930','SNK-004','Roasted salted peanuts',        40.00, 70.00,0,'pack',   60,10,1,1,NOW(),NOW()),
      (10,3,3,'Fresh Milk 1L',            'fresh-milk-1l',            '5000112637931','DAI-001','Full cream fresh milk',        115.00,175.00,0,'litre',  50,10,1,1,NOW(),NOW()),
      (11,3,3,'Curd 400g',                'curd-400g',                '5000112637932','DAI-002','Plain set curd',                70.00,110.00,0,'cup',    40, 8,1,1,NOW(),NOW()),
      (12,3,3,'Butter 200g',              'butter-200g',              '5000112637933','DAI-003','Unsalted butter block',        165.00,240.00,0,'block',  35, 5,1,1,NOW(),NOW()),
      (13,3,3,'Cheese Slice 200g',        'cheese-slice-200g',        '5000112637934','DAI-004','Processed cheese slices',      200.00,295.00,0,'pack',   25, 5,1,1,NOW(),NOW()),
      (14,4,4,'White Bread Loaf',         'white-bread-loaf',         '5000112637935','BAK-001','Sliced white bread',            80.00,130.00,0,'loaf',   30, 5,1,1,NOW(),NOW()),
      (15,4,4,'Croissant',                'croissant',                '5000112637936','BAK-002','Butter croissant',              55.00, 90.00,0,'piece',  40,10,1,1,NOW(),NOW()),
      (16,5,5,'Dove Soap 100g',           'dove-soap-100g',           '5000112637937','CRE-001','Moisturising bar soap',        120.00,185.00,0,'bar',    60,10,1,1,NOW(),NOW()),
      (17,5,5,'Head and Shoulders 200ml', 'head-and-shoulders-200ml', '5000112637938','CRE-002','Anti-dandruff shampoo',        320.00,475.00,0,'bottle', 45, 8,1,1,NOW(),NOW()),
      (18,5,5,'Colgate Toothpaste 150g',  'colgate-toothpaste-150g',  '5000112637939','CRE-003','Fresh mint toothpaste',        175.00,260.00,0,'tube',   55,10,1,1,NOW(),NOW()),
      (19,6,5,'Vim Dishwash Bar',         'vim-dishwash-bar',         '5000112637940','CLN-001','Dishwashing bar 400g',          65.00,105.00,0,'bar',    70,10,1,1,NOW(),NOW()),
      (20,6,5,'Dettol Handwash 250ml',    'dettol-handwash-250ml',    '5000112637941','CLN-002','Antibacterial handwash',       210.00,315.00,0,'bottle', 50,10,1,1,NOW(),NOW()),
      (21,6,6,'Baygon Spray 400ml',       'baygon-spray-400ml',       '5000112637942','CLN-003','Insect killer spray',          350.00,495.00,0,'bottle', 30, 5,1,1,NOW(),NOW()),
      (22,7,7,'Ballpoint Pen Blue',       'ballpoint-pen-blue',       '5000112637943','STA-001','Blue ink ballpoint pen',        15.00, 30.00,0,'piece', 200,30,1,1,NOW(),NOW()),
      (23,7,7,'A4 Notebook 200 pages',    'a4-notebook-200-pages',    '5000112637944','STA-002','Ruled notebook A4',            120.00,195.00,0,'book',   60,10,1,1,NOW(),NOW()),
      (24,8,2,'Vanilla Ice Cream 500ml',  'vanilla-ice-cream-500ml',  '5000112637945','FRZ-001','Vanilla flavour ice cream',    175.00,265.00,0,'tub',    25, 5,1,1,NOW(),NOW()),
      (25,9,2,'Tomato Ketchup 300g',      'tomato-ketchup-300g',      '5000112637946','CON-001','Tomato ketchup',               180.00,265.00,0,'bottle', 40, 8,1,1,NOW(),NOW()),
      (26,9,2,'Soy Sauce 150ml',          'soy-sauce-150ml',          '5000112637947','CON-002','Dark soy sauce',                55.00, 95.00,0,'bottle', 35, 5,1,1,NOW(),NOW()),
      (27,10,7,'AA Battery 4-pack',       'aa-battery-4-pack',        '5000112637948','ELC-001','Alkaline AA batteries',        150.00,225.00,0,'pack',   80,15,1,1,NOW(),NOW()),
      (28,10,7,'USB-C Cable 1m',          'usb-c-cable-1m',           '5000112637949','ELC-002','Fast charge USB-C cable',      280.00,450.00,0,'piece',  40, 8,1,1,NOW(),NOW()),
      (29,1,1, 'Red Bull 250ml',          'red-bull-250ml',           '5000112637950','BEV-006','Energy drink',                 175.00,280.00,0,'can',    70,15,1,1,NOW(),NOW()),
      (30,2,2, 'Oreo Cookies 137g',       'oreo-cookies-137g',        '5000112637951','SNK-005','Chocolate sandwich cookies',   130.00,195.00,0,'pack',   65,10,1,1,NOW(),NOW())`);
    console.log('✅ Products (30)');

    // CUSTOMERS
    await run(`INSERT INTO customers (id,name,phone,email,address,city,total_spent,notes,created_at,updated_at) VALUES
      (1, 'Kamal Perera',       '+94712345678','kamal@gmail.com',   '12 Flower Rd',           'Colombo',15750.00,'Regular customer',  NOW(),NOW()),
      (2, 'Nimali Fernando',    '+94773456789','nimali@gmail.com',  '45 Temple Rd',           'Kandy',   8200.00,'Monthly buyer',     NOW(),NOW()),
      (3, 'Rajesh Kumar',       '+94764567890','rajesh@gmail.com',  '7 Main St',              'Colombo',22400.00,'Wholesale customer',NOW(),NOW()),
      (4, 'Sanduni Silva',      '+94705678901','sanduni@yahoo.com', '33 Galle Rd',            'Galle',   5100.00,NULL,                NOW(),NOW()),
      (5, 'Pradeep Jayasena',   '+94726789012',NULL,               '89 High Level Rd',       'Nugegoda', 9800.00,NULL,               NOW(),NOW()),
      (6, 'Chamari Wickrama',   '+94757890123','chamari@gmail.com', '22 Hill St',             'Kandy',   3300.00,NULL,                NOW(),NOW()),
      (7, 'Asanka Dissanayake', '+94788901234',NULL,               '5 Station Rd',           'Matara',   7650.00,'Credit customer',  NOW(),NOW()),
      (8, 'Dilani Mendis',      '+94719012345','dilani@hotmail.com','18 Rajapihilla Mawatha', 'Kandy',   4200.00,NULL,                NOW(),NOW()),
      (9, 'Harsha Bandara',     '+94770123456',NULL,               '67 Baseline Rd',         'Colombo',11200.00,'Bulk buyer',        NOW(),NOW()),
      (10,'Tharindi Senanayake','+94761234567','tharindi@gmail.com','14 Bauddhaloka Mawatha', 'Colombo', 6800.00,NULL,               NOW(),NOW())`);
    console.log('✅ Customers (10)');

    // SALES
    await run(`INSERT INTO sales (id,invoice_number,cashier_id,customer_id,subtotal,discount_type,discount_value,discount_amount,tax_rate,tax_amount,total_amount,amount_tendered,change_amount,status,notes,sale_date,created_at,updated_at) VALUES
      (1, 'INV-2026-000001',3,1,  380.00,NULL,        0,  0.00,0,0.00, 380.00, 400.00,20.00,'completed',NULL,               DATE_SUB(NOW(),INTERVAL 7 DAY),DATE_SUB(NOW(),INTERVAL 7 DAY),DATE_SUB(NOW(),INTERVAL 7 DAY)),
      (2, 'INV-2026-000002',3,2,  510.00,'percentage',10, 51.00,0,0.00,459.00, 500.00,41.00,'completed',NULL,               DATE_SUB(NOW(),INTERVAL 7 DAY),DATE_SUB(NOW(),INTERVAL 7 DAY),DATE_SUB(NOW(),INTERVAL 7 DAY)),
      (3, 'INV-2026-000003',4,NULL,400.00,NULL,        0,  0.00,0,0.00, 400.00, 400.00, 0.00,'completed',NULL,              DATE_SUB(NOW(),INTERVAL 6 DAY),DATE_SUB(NOW(),INTERVAL 6 DAY),DATE_SUB(NOW(),INTERVAL 6 DAY)),
      (4, 'INV-2026-000004',3,3, 1105.00,'fixed',    100,100.00,0,0.00,1005.00,1100.00,95.00,'completed','Wholesale order', DATE_SUB(NOW(),INTERVAL 6 DAY),DATE_SUB(NOW(),INTERVAL 6 DAY),DATE_SUB(NOW(),INTERVAL 6 DAY)),
      (5, 'INV-2026-000005',4,4,  580.00,NULL,        0,  0.00,0,0.00, 580.00, 600.00,20.00,'completed',NULL,               DATE_SUB(NOW(),INTERVAL 5 DAY),DATE_SUB(NOW(),INTERVAL 5 DAY),DATE_SUB(NOW(),INTERVAL 5 DAY)),
      (6, 'INV-2026-000006',3,5,  395.00,NULL,        0,  0.00,0,0.00, 395.00, 400.00, 5.00,'completed',NULL,               DATE_SUB(NOW(),INTERVAL 5 DAY),DATE_SUB(NOW(),INTERVAL 5 DAY),DATE_SUB(NOW(),INTERVAL 5 DAY)),
      (7, 'INV-2026-000007',3,NULL,275.00,NULL,       0,  0.00,0,0.00, 275.00, 300.00,25.00,'completed',NULL,               DATE_SUB(NOW(),INTERVAL 4 DAY),DATE_SUB(NOW(),INTERVAL 4 DAY),DATE_SUB(NOW(),INTERVAL 4 DAY)),
      (8, 'INV-2026-000008',4,6,  760.00,'percentage', 5, 38.00,0,0.00,722.00, 800.00,78.00,'completed',NULL,               DATE_SUB(NOW(),INTERVAL 4 DAY),DATE_SUB(NOW(),INTERVAL 4 DAY),DATE_SUB(NOW(),INTERVAL 4 DAY)),
      (9, 'INV-2026-000009',3,7,  465.00,NULL,        0,  0.00,0,0.00, 465.00, 500.00,35.00,'completed',NULL,               DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY)),
      (10,'INV-2026-000010',4,NULL,275.00,NULL,       0,  0.00,0,0.00, 275.00, 300.00,25.00,'voided',   'Customer cancelled',DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY)),
      (11,'INV-2026-000011',3,8,  905.00,NULL,        0,  0.00,0,0.00, 905.00,1000.00,95.00,'completed',NULL,               DATE_SUB(NOW(),INTERVAL 2 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY)),
      (12,'INV-2026-000012',4,9, 1545.00,'fixed',    200,200.00,0,0.00,1345.00,1400.00,55.00,'completed','Bulk buy',        DATE_SUB(NOW(),INTERVAL 2 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY)),
      (13,'INV-2026-000013',3,10, 275.00,NULL,        0,  0.00,0,0.00, 275.00, 300.00,25.00,'completed',NULL,               DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY)),
      (14,'INV-2026-000014',4,1,  545.00,'percentage',10, 54.50,0,0.00,490.50, 500.00, 9.50,'completed',NULL,               DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY)),
      (15,'INV-2026-000015',3,2,  250.00,NULL,        0,  0.00,0,0.00, 250.00, 250.00, 0.00,'completed',NULL,               NOW(),NOW(),NOW()),
      (16,'INV-2026-000016',4,3,  980.00,NULL,        0,  0.00,0,0.00, 980.00,1000.00,20.00,'completed','Wholesale',        NOW(),NOW(),NOW()),
      (17,'INV-2026-000017',3,NULL,420.00,NULL,       0,  0.00,0,0.00, 420.00, 500.00,80.00,'completed',NULL,               NOW(),NOW(),NOW()),
      (18,'INV-2026-000018',4,5,  910.00,'percentage', 5, 45.50,0,0.00,864.50, 900.00,35.50,'completed',NULL,               NOW(),NOW(),NOW()),
      (19,'INV-2026-000019',3,NULL,160.00,NULL,       0,  0.00,0,0.00, 160.00, 200.00,40.00,'completed',NULL,               NOW(),NOW(),NOW()),
      (20,'INV-2026-000020',4,4,  590.00,NULL,        0,  0.00,0,0.00, 590.00, 600.00,10.00,'refunded', 'Returned items',   NOW(),NOW(),NOW())`);
    console.log('✅ Sales (20)');

    // SALE ITEMS
   await run(`INSERT INTO sale_items (sale_id,product_id,product_name,barcode,unit,unit_price,cost_price,quantity,discount_amount,tax_rate,line_total) VALUES
      (1,1,'Coca-Cola 330ml',         '5000112637922','can',    95.00,60.00,2,0,0,190.00),
      (1,3,'Water Bottle 500ml',      '5000112637924','bottle', 35.00,15.00,3,0,0,105.00),
      (1,7,'Marie Biscuits 200g',     '5000112637928','pack',   75.00,45.00,1,0,0, 75.00),
      (1,8,'Chocolate Bar 50g',       '5000112637929','bar',   100.00,60.00,1,0,0,100.00),
      (2,6,'Lays Classic Chips 100g', '5000112637927','pack',  120.00,75.00,2,0,0,240.00),
      (2,5,'Milo 200ml',              '5000112637926','pack',   85.00,55.00,1,0,0, 85.00),
      (2,16,'Dove Soap 100g',         '5000112637937','bar',   185.00,120.00,1,0,0,185.00),
      (3,1,'Coca-Cola 330ml',         '5000112637922','can',    95.00,60.00,1,0,0, 95.00),
      (3,14,'White Bread Loaf',       '5000112637935','loaf',  130.00,80.00,1,0,0,130.00),
      (3,10,'Fresh Milk 1L',          '5000112637931','litre', 175.00,115.00,1,0,0,175.00),
      (4,3,'Water Bottle 500ml',      '5000112637924','bottle', 35.00,15.00,10,0,0,350.00),
      (4,1,'Coca-Cola 330ml',         '5000112637922','can',    95.00,60.00,4,0,0,380.00),
      (4,7,'Marie Biscuits 200g',     '5000112637928','pack',   75.00,45.00,3,0,0,225.00),
      (4,22,'Ballpoint Pen Blue',     '5000112637943','piece',  30.00,15.00,5,0,0,150.00),
      (5,17,'Head and Shoulders 200ml','5000112637938','bottle',475.00,320.00,1,0,0,475.00),
      (5,19,'Vim Dishwash Bar',       '5000112637940','bar',   105.00,65.00,1,0,0,105.00),
      (6,8,'Chocolate Bar 50g',       '5000112637929','bar',   100.00,60.00,2,0,0,200.00),
      (6,30,'Oreo Cookies 137g',      '5000112637951','pack',  195.00,130.00,1,0,0,195.00),
      (7,3,'Water Bottle 500ml',      '5000112637924','bottle', 35.00,15.00,2,0,0, 70.00),
      (7,15,'Croissant',              '5000112637936','piece',  90.00,55.00,1,0,0, 90.00),
      (7,11,'Curd 400g',              '5000112637932','cup',   110.00,70.00,1,0,0,110.00),
      (8,18,'Colgate Toothpaste 150g','5000112637939','tube',  260.00,175.00,1,0,0,260.00),
      (8,20,'Dettol Handwash 250ml',  '5000112637941','bottle',315.00,210.00,1,0,0,315.00),
      (8,16,'Dove Soap 100g',         '5000112637937','bar',   185.00,120.00,1,0,0,185.00),
      (9,4,'Orange Juice 1L',         '5000112637925','bottle',195.00,120.00,2,0,0,390.00),
      (9,7,'Marie Biscuits 200g',     '5000112637928','pack',   75.00,45.00,1,0,0, 75.00),
      (10,3,'Water Bottle 500ml',     '5000112637924','bottle', 35.00,15.00,2,0,0, 70.00),
      (10,15,'Croissant',             '5000112637936','piece',  90.00,55.00,1,0,0, 90.00),
      (10,11,'Curd 400g',             '5000112637932','cup',   110.00,70.00,1,0,0,110.00),
      (11,12,'Butter 200g',           '5000112637933','block', 240.00,165.00,2,0,0,480.00),
      (11,13,'Cheese Slice 200g',     '5000112637934','pack',  295.00,200.00,1,0,0,295.00),
      (11,14,'White Bread Loaf',      '5000112637935','loaf',  130.00,80.00,1,0,0,130.00),
      (12,27,'AA Battery 4-pack',     '5000112637948','pack',  225.00,150.00,4,0,0,900.00),
      (12,28,'USB-C Cable 1m',        '5000112637949','piece', 450.00,280.00,1,0,0,450.00),
      (12,23,'A4 Notebook 200 pages', '5000112637944','book',  195.00,120.00,1,0,0,195.00),
      (13,3,'Water Bottle 500ml',     '5000112637924','bottle', 35.00,15.00,3,0,0,105.00),
      (13,9,'Peanuts 150g',           '5000112637930','pack',   70.00,40.00,1,0,0, 70.00),
      (13,8,'Chocolate Bar 50g',      '5000112637929','bar',   100.00,60.00,1,0,0,100.00),
      (14,29,'Red Bull 250ml',        '5000112637950','can',   280.00,175.00,1,0,0,280.00),
      (14,25,'Tomato Ketchup 300g',   '5000112637946','bottle',265.00,180.00,1,0,0,265.00),
      (15,5,'Milo 200ml',             '5000112637926','pack',   85.00,55.00,1,0,0, 85.00),
      (15,7,'Marie Biscuits 200g',    '5000112637928','pack',   75.00,45.00,1,0,0, 75.00),
      (15,15,'Croissant',             '5000112637936','piece',  90.00,55.00,1,0,0, 90.00),
      (16,1,'Coca-Cola 330ml',        '5000112637922','can',    95.00,60.00,6,0,0,570.00),
      (16,3,'Water Bottle 500ml',     '5000112637924','bottle', 35.00,15.00,6,0,0,210.00),
      (16,8,'Chocolate Bar 50g',      '5000112637929','bar',   100.00,60.00,2,0,0,200.00),
      (17,19,'Vim Dishwash Bar',      '5000112637940','bar',   105.00,65.00,2,0,0,210.00),
      (17,20,'Dettol Handwash 250ml', '5000112637941','bottle',315.00,210.00,1,0,0,315.00),
      (18,21,'Baygon Spray 400ml',    '5000112637942','bottle',495.00,350.00,1,0,0,495.00),
      (18,22,'Ballpoint Pen Blue',    '5000112637943','piece',  30.00,15.00,5,0,0,150.00),
      (18,24,'Vanilla Ice Cream 500ml','5000112637945','tub',  265.00,175.00,1,0,0,265.00),
      (19,3,'Water Bottle 500ml',     '5000112637924','bottle', 35.00,15.00,2,0,0, 70.00),
      (19,15,'Croissant',             '5000112637936','piece',  90.00,55.00,1,0,0, 90.00),
      (20,10,'Fresh Milk 1L',         '5000112637931','litre', 175.00,115.00,2,0,0,350.00),
      (20,11,'Curd 400g',             '5000112637932','cup',   110.00,70.00,1,0,0,110.00),
      (20,14,'White Bread Loaf',      '5000112637935','loaf',  130.00,80.00,1,0,0,130.00)`);
    console.log('✅ Sale Items');

    // SALE PAYMENTS
    await run(`INSERT INTO sale_payments (sale_id,payment_method_id,amount) VALUES
      (1,1, 380.00),
      (2,1, 459.00),
      (3,2, 400.00),
      (4,1,1005.00),
      (5,3, 580.00),
      (6,4, 395.00),
      (7,1, 275.00),
      (8,2, 722.00),
      (9,1, 465.00),
      (10,1,275.00),
      (11,1,905.00),
      (12,5,1345.00),
      (13,4,275.00),
      (14,2,490.50),
      (15,1,250.00),
      (16,1,980.00),
      (17,3,420.00),
      (18,4,864.50),
      (19,1,160.00),
      (20,1,590.00)`);
    console.log('✅ Sale Payments');

    // REFUNDS
    await run(`INSERT INTO refunds (id,sale_id,refund_number,cashier_id,refund_method,total_refunded,reason,status,refunded_at,created_at,updated_at) VALUES
      (1,10,'REF-2026-000001',3,'cash',275.00,'Customer changed mind','completed',DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY)),
      (2,20,'REF-2026-000002',4,'cash',590.00,'Dairy products expired','completed',NOW(),NOW(),NOW())`);
    console.log('✅ Refunds');

    // REFUND ITEMS
    await run(`INSERT INTO refund_items (refund_id,sale_item_id,product_id,product_name,quantity,unit_price,refund_amount,restock,created_at) VALUES
      (1,27,3, 'Water Bottle 500ml',2, 35.00, 70.00,1,DATE_SUB(NOW(),INTERVAL 3 DAY)),
      (1,28,15,'Croissant',         1, 90.00, 90.00,0,DATE_SUB(NOW(),INTERVAL 3 DAY)),
      (1,29,11,'Curd 400g',         1,110.00,110.00,1,DATE_SUB(NOW(),INTERVAL 3 DAY)),
      (2,53,10,'Fresh Milk 1L',     2,175.00,350.00,0,NOW()),
      (2,54,11,'Curd 400g',         1,110.00,110.00,0,NOW()),
      (2,55,14,'White Bread Loaf',  1,130.00,130.00,1,NOW())`);
    console.log('✅ Refund Items');

    // STOCK MOVEMENTS
    const stockQtys = [150,120,200,80,100,90,80,150,60,50,40,35,25,30,40,60,45,55,70,50,30,200,60,25,40,35,80,40,70,65];
    const initRows = stockQtys.map((qty,i) =>
      `(${i+1},1,'stock_in',${qty},0,${qty},'Initial stock opening',DATE_SUB(NOW(),INTERVAL 14 DAY))`
    ).join(',');
    await run(`INSERT INTO stock_movements (product_id,performed_by,movement_type,quantity_change,quantity_before,quantity_after,notes,created_at) VALUES ${initRows}`);
    await run(`INSERT INTO stock_movements (product_id,performed_by,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,notes,created_at) VALUES
      (1, 3,'sale', -2,150,148,'sale', 1,'Sale INV-2026-000001',DATE_SUB(NOW(),INTERVAL 7 DAY)),
      (3, 3,'sale', -3,200,197,'sale', 1,'Sale INV-2026-000001',DATE_SUB(NOW(),INTERVAL 7 DAY)),
      (6, 3,'sale', -2, 90, 88,'sale', 2,'Sale INV-2026-000002',DATE_SUB(NOW(),INTERVAL 7 DAY)),
      (10,3,'sale', -1, 50, 49,'sale', 3,'Sale INV-2026-000003',DATE_SUB(NOW(),INTERVAL 6 DAY)),
      (1, 3,'sale', -4,148,144,'sale', 4,'Sale INV-2026-000004',DATE_SUB(NOW(),INTERVAL 6 DAY)),
      (3, 3,'sale',-10,197,187,'sale', 4,'Sale INV-2026-000004',DATE_SUB(NOW(),INTERVAL 6 DAY)),
      (17,4,'sale', -1, 45, 44,'sale', 5,'Sale INV-2026-000005',DATE_SUB(NOW(),INTERVAL 5 DAY)),
      (27,4,'sale', -4, 80, 76,'sale',12,'Sale INV-2026-000012',DATE_SUB(NOW(),INTERVAL 2 DAY)),
      (28,4,'sale', -1, 40, 39,'sale',12,'Sale INV-2026-000012',DATE_SUB(NOW(),INTERVAL 2 DAY)),
      (1, 4,'sale', -6,144,138,'sale',16,'Sale INV-2026-000016',NOW()),
      (3, 4,'sale', -6,187,181,'sale',16,'Sale INV-2026-000016',NOW()),
      (1, 2,'adjustment',50,138,188,'','','Restock from supplier',DATE_SUB(NOW(),INTERVAL 3 DAY)),
      (3, 2,'adjustment',100,181,281,'','','Restock from supplier',DATE_SUB(NOW(),INTERVAL 3 DAY)),
      (10,2,'adjustment', 30, 49, 79,'','','Dairy restock',        DATE_SUB(NOW(),INTERVAL 2 DAY))`);
    console.log('✅ Stock Movements');

    // PURCHASE ORDERS
    await run(`INSERT INTO purchase_orders (id,po_number,supplier_id,created_by,status,subtotal,tax_amount,total_amount,notes,ordered_at,expected_at,received_at,created_at,updated_at) VALUES
      (1,'PO-2026-000001',1,2,'received',3500.00,0,3500.00,'Monthly beverage restock',DATE_SUB(NOW(),INTERVAL 10 DAY),DATE_SUB(NOW(),INTERVAL 7 DAY),DATE_SUB(NOW(),INTERVAL 7 DAY),DATE_SUB(NOW(),INTERVAL 10 DAY),DATE_SUB(NOW(),INTERVAL 7 DAY)),
      (2,'PO-2026-000002',3,2,'received',2800.00,0,2800.00,'Dairy weekly order',      DATE_SUB(NOW(),INTERVAL 5 DAY), DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 5 DAY), DATE_SUB(NOW(),INTERVAL 3 DAY)),
      (3,'PO-2026-000003',5,2,'ordered', 5200.00,0,5200.00,'Personal care restock',   DATE_SUB(NOW(),INTERVAL 1 DAY), DATE_ADD(NOW(),INTERVAL 3 DAY),NULL,                           DATE_SUB(NOW(),INTERVAL 1 DAY), DATE_SUB(NOW(),INTERVAL 1 DAY)),
      (4,'PO-2026-000004',7,2,'ordered', 6700.00,0,6700.00,'Electronics Q1 order',    NOW(),                          DATE_ADD(NOW(),INTERVAL 7 DAY),NULL,                           NOW(),NOW())`);
    console.log('✅ Purchase Orders');

    // PURCHASE ORDER ITEMS
    await run(`INSERT INTO purchase_order_items (purchase_order_id,product_id,product_name,quantity_ordered,quantity_received,unit_cost,line_total,created_at) VALUES
      (1,1, 'Coca-Cola 330ml',       50,50, 60.00,3000.00,DATE_SUB(NOW(),INTERVAL 10 DAY)),
      (1,2, 'Pepsi 330ml',            5, 5, 58.00, 290.00,DATE_SUB(NOW(),INTERVAL 10 DAY)),
      (1,29,'Red Bull 250ml',         1, 1,175.00, 175.00,DATE_SUB(NOW(),INTERVAL 10 DAY)),
      (2,10,'Fresh Milk 1L',         20,20,115.00,2300.00,DATE_SUB(NOW(),INTERVAL  5 DAY)),
      (2,11,'Curd 400g',              5, 5, 70.00, 350.00,DATE_SUB(NOW(),INTERVAL  5 DAY)),
      (2,12,'Butter 200g',            1, 1,165.00, 165.00,DATE_SUB(NOW(),INTERVAL  5 DAY)),
      (3,16,'Dove Soap 100g',        20, 0,120.00,2400.00,DATE_SUB(NOW(),INTERVAL  1 DAY)),
      (3,17,'Head and Shoulders 200ml',10,0,320.00,3200.00,DATE_SUB(NOW(),INTERVAL 1 DAY)),
      (4,27,'AA Battery 4-pack',     20, 0,150.00,3000.00,NOW()),
      (4,28,'USB-C Cable 1m',        10, 0,280.00,2800.00,NOW()),
      (4,22,'Ballpoint Pen Blue',    30, 0, 15.00, 450.00,NOW())`);
    console.log('✅ Purchase Order Items');

    // DAILY SUMMARIES
    await run(`INSERT INTO daily_summaries (summary_date,total_transactions,gross_revenue,total_discounts,tax_amount,net_revenue,total_refunds,refund_count,void_count,cogs,gross_profit,created_at,updated_at) VALUES
      (DATE_SUB(CURDATE(),INTERVAL 7 DAY),2, 890.00, 51.00,0, 839.00,   0.00,0,0, 420.00, 419.00,NOW(),NOW()),
      (DATE_SUB(CURDATE(),INTERVAL 6 DAY),2,1505.00,100.00,0,1405.00,   0.00,0,0, 650.00, 755.00,NOW(),NOW()),
      (DATE_SUB(CURDATE(),INTERVAL 5 DAY),2, 975.00,  0.00,0, 975.00,   0.00,0,0, 510.00, 465.00,NOW(),NOW()),
      (DATE_SUB(CURDATE(),INTERVAL 4 DAY),2, 998.00, 38.00,0, 960.00,   0.00,0,0, 480.00, 480.00,NOW(),NOW()),
      (DATE_SUB(CURDATE(),INTERVAL 3 DAY),2, 740.00,  0.00,0, 740.00, 275.00,1,1, 370.00, 370.00,NOW(),NOW()),
      (DATE_SUB(CURDATE(),INTERVAL 2 DAY),2,2450.00,200.00,0,2250.00,   0.00,0,0,1020.00,1230.00,NOW(),NOW()),
      (DATE_SUB(CURDATE(),INTERVAL 1 DAY),2, 820.00, 54.50,0, 765.50,   0.00,0,0, 390.00, 375.50,NOW(),NOW()),
      (CURDATE(),                          5,2914.50, 45.50,0,2869.00, 590.00,1,0,1250.00,1619.00,NOW(),NOW())`);
    console.log('✅ Daily Summaries');

    // AUDIT LOGS
    await run(`INSERT INTO audit_logs (user_id,action,entity_type,entity_id,old_values,new_values,ip_address,created_at) VALUES
      (1,'CREATE','product',  1,  NULL,                        '{"name":"Coca-Cola 330ml","selling_price":95}',      '127.0.0.1',DATE_SUB(NOW(),INTERVAL 14 DAY)),
      (1,'CREATE','user',     4,  NULL,                        '{"username":"cashier2","role":"cashier"}',           '127.0.0.1',DATE_SUB(NOW(),INTERVAL 13 DAY)),
      (2,'UPDATE','product',  1,  '{"selling_price":90}',      '{"selling_price":95}',                              '127.0.0.1',DATE_SUB(NOW(),INTERVAL 10 DAY)),
      (2,'CREATE','purchase_order',1,NULL,                     '{"po":"PO-2026-000001"}',                           '127.0.0.1',DATE_SUB(NOW(),INTERVAL 10 DAY)),
      (3,'CREATE','sale',     1,  NULL,                        '{"invoice":"INV-2026-000001","total":380}',         '127.0.0.1',DATE_SUB(NOW(),INTERVAL 7 DAY)),
      (4,'CREATE','sale',     3,  NULL,                        '{"invoice":"INV-2026-000003","total":400}',         '127.0.0.1',DATE_SUB(NOW(),INTERVAL 6 DAY)),
      (1,'UPDATE','settings', 1,  '{"store_name":"My Store"}', '{"store_name":"RetailPOS Store"}',                  '127.0.0.1',DATE_SUB(NOW(),INTERVAL 5 DAY)),
      (3,'VOID',  'sale',     10, '{"status":"completed"}',    '{"status":"voided"}',                              '127.0.0.1',DATE_SUB(NOW(),INTERVAL 3 DAY)),
      (4,'CREATE','refund',   2,  NULL,                        '{"refund":"REF-2026-000002","total":590}',          '127.0.0.1',NOW())`);
    console.log('✅ Audit Logs');

    console.log('\n🎉 ALL DONE!\n');
    console.log('  admin    / Admin@1234');
    console.log('  manager  / Manager@1234');
    console.log('  cashier1 / Cashier@1234  PIN: 1234');
    console.log('  cashier2 / Cashier@1234  PIN: 1234');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();