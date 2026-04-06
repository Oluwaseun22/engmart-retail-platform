-- ============================================================
-- ENGMart — Seed Data (Development / Demo)
-- Run AFTER 01_schema.sql
-- ============================================================
USE engmart;

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, description) VALUES
  ('Clothing',      'Dresses, tops, trousers, jackets and all apparel'),
  ('Accessories',   'Jewellery, scarves, belts, hats and fashion accessories'),
  ('Footwear',      'Shoes, boots, sandals and trainers'),
  ('Bags',          'Handbags, backpacks, clutches and purses'),
  ('Homeware',      'Candles, cushions, prints and home decor');

-- ============================================================
-- USERS  (passwords are bcrypt of "Password123!")
-- Hash generated with bcrypt cost factor 12
-- ============================================================
INSERT INTO users (username, email, password_hash, role) VALUES
  ('sarah_admin',
   'sarah@engmart.co.uk',
   '$2b$12$K1Lnvb/dq6T6s9x7c5Y7E.YGT8fDnN0EvDJb.aBcWxPbRsTv0BmPm',
   'admin'),
  ('james_staff',
   'james@engmart.co.uk',
   '$2b$12$K1Lnvb/dq6T6s9x7c5Y7E.YGT8fDnN0EvDJb.aBcWxPbRsTv0BmPm',
   'staff'),
  ('amara_staff',
   'amara@engmart.co.uk',
   '$2b$12$K1Lnvb/dq6T6s9x7c5Y7E.YGT8fDnN0EvDJb.aBcWxPbRsTv0BmPm',
   'staff');

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO products (name, sku, description, price, category_id) VALUES
  -- Clothing
  ('Blue Silk Midi Dress',       'CLO-001', 'Elegant blue silk midi dress, perfect for occasions', 89.99,  1),
  ('White Linen Blazer',         'CLO-002', 'Relaxed linen blazer in off-white, sizes XS-XL',      155.00, 1),
  ('Black Skinny Jeans',         'CLO-003', 'Classic black high-waist skinny jeans',               65.00,  1),
  ('Floral Wrap Skirt',          'CLO-004', 'Floral print wrap-style midi skirt',                  49.99,  1),
  ('Camel Trench Coat',          'CLO-005', 'Classic double-breasted camel trench coat',            229.00, 1),
  -- Accessories
  ('Gold Chain Necklace',        'ACC-001', '18k gold plated chain necklace, 45cm',                45.00,  2),
  ('Silver Hoop Earrings',       'ACC-002', 'Sterling silver large hoop earrings',                 32.00,  2),
  ('Silk Printed Scarf',         'ACC-003', '100% silk square scarf with floral print',            55.00,  2),
  ('Leather Belt - Brown',       'ACC-004', 'Genuine leather belt in tan brown, adjustable',       38.00,  2),
  -- Footwear
  ('White Canvas Trainers',      'FOO-001', 'Classic white canvas low-top trainers',               120.00, 3),
  ('Black Ankle Boots',          'FOO-002', 'Leather-look ankle boots with block heel',            95.00,  3),
  ('Nude Court Heels',           'FOO-003', 'Pointed toe court heels in nude/beige',               85.00,  3),
  -- Bags
  ('Red Leather Tote Bag',       'BAG-001', 'Spacious genuine leather tote bag in red',            145.00, 4),
  ('Black Clutch Evening Bag',   'BAG-002', 'Satin evening clutch bag with gold clasp',            65.00,  4),
  ('Tan Crossbody Bag',          'BAG-003', 'Compact tan crossbody bag with adjustable strap',     89.00,  4),
  -- Homeware
  ('Rose Scented Candle',        'HOM-001', 'Hand-poured soy wax candle with rose fragrance, 40hr burn', 24.99, 5),
  ('Velvet Cushion - Blush',     'HOM-002', 'Velvet cushion cover in blush pink, 45x45cm',         35.00,  5),
  ('Botanical Print A3',         'HOM-003', 'Framed botanical illustration print, A3',              49.99,  5);

-- ============================================================
-- INVENTORY  (one record per product)
-- ============================================================
INSERT INTO inventory (product_id, quantity, reorder_level) VALUES
  (1,  24, 10),   -- Blue Silk Midi Dress
  (2,  6,  10),   -- White Linen Blazer      ← LOW
  (3,  30, 10),   -- Black Skinny Jeans
  (4,  18, 10),   -- Floral Wrap Skirt
  (5,  4,  10),   -- Camel Trench Coat        ← LOW
  (6,  40, 15),   -- Gold Chain Necklace
  (7,  35, 15),   -- Silver Hoop Earrings
  (8,  12, 10),   -- Silk Printed Scarf
  (9,  22, 10),   -- Leather Belt
  (10, 3,  10),   -- White Canvas Trainers    ← CRITICAL
  (11, 15, 10),   -- Black Ankle Boots
  (12, 9,  10),   -- Nude Court Heels
  (13, 7,  8),    -- Red Leather Tote
  (14, 20, 8),    -- Black Clutch
  (15, 11, 8),    -- Tan Crossbody
  (16, 50, 20),   -- Rose Candle
  (17, 25, 15),   -- Velvet Cushion
  (18, 14, 10);   -- Botanical Print

-- ============================================================
-- SAMPLE SALES  (last 7 days)
-- ============================================================
INSERT INTO sales (user_id, total_amount, payment_method, status, created_at) VALUES
  (2, 224.98, 'card',          'completed', NOW() - INTERVAL 0 DAY),
  (3, 89.99,  'cash',          'completed', NOW() - INTERVAL 0 DAY),
  (2, 155.00, 'card',          'completed', NOW() - INTERVAL 1 DAY),
  (3, 417.00, 'bank_transfer', 'completed', NOW() - INTERVAL 1 DAY),
  (2, 65.00,  'cash',          'completed', NOW() - INTERVAL 2 DAY),
  (3, 184.99, 'card',          'completed', NOW() - INTERVAL 3 DAY),
  (2, 310.00, 'card',          'completed', NOW() - INTERVAL 4 DAY),
  (3, 74.99,  'cash',          'completed', NOW() - INTERVAL 5 DAY),
  (2, 229.00, 'card',          'completed', NOW() - INTERVAL 6 DAY),
  (3, 99.99,  'cash',          'completed', NOW() - INTERVAL 7 DAY);

-- ============================================================
-- SAMPLE SALE ITEMS
-- ============================================================
-- Sale 1: Blue Dress x2 + Gold Necklace x1
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
  (1, 1, 2, 89.99, 179.98),
  (1, 6, 1, 45.00, 45.00);

-- Sale 2: Blue Dress x1
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
  (2, 1, 1, 89.99, 89.99);

-- Sale 3: White Linen Blazer x1
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
  (3, 2, 1, 155.00, 155.00);

-- Sale 4: Camel Trench Coat x1 + Black Ankle Boots x1 + Tan Crossbody x1
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
  (4, 5,  1, 229.00, 229.00),
  (4, 11, 1, 95.00,  95.00),
  (4, 15, 1, 89.00,  89.00);

-- Sale 5: Black Skinny Jeans x1
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
  (5, 3, 1, 65.00, 65.00);

-- Sale 6: White Canvas Trainers x1 + Silver Earrings x1 + Floral Skirt x1
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
  (6, 10, 1, 120.00, 120.00),
  (6, 7,  1, 32.00,  32.00),
  (6, 4,  1, 49.99,  49.99);

-- Sale 7: Red Leather Tote x1 + Nude Court Heels x1 + Silk Scarf x1
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
  (7, 13, 1, 145.00, 145.00),
  (7, 12, 1, 85.00,  85.00),
  (7, 8,  1, 55.00,  55.00);

-- Sale 8: Velvet Cushion x1 + Rose Candle x2
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
  (8, 17, 1, 35.00, 35.00),
  (8, 16, 2, 24.99, 49.98);

-- Sale 9: Camel Trench Coat x1
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
  (9, 5, 1, 229.00, 229.00);

-- Sale 10: Leather Belt x1 + Black Clutch x1 + Botanical Print x1
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
  (10, 9,  1, 38.00, 38.00),
  (10, 14, 1, 65.00, 65.00),
  (10, 18, 1, 49.99, 49.99);
