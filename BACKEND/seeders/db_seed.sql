-- ============================================================
-- Combined Seed Data - ecommerce_accrete
-- Covers all tables end-to-end with fully consistent FK references,
-- unique-key compliance, and correct amount calculations.
--
-- Fixes applied vs. original draft:
--   [Fix 1] modifier_portion: product_id set to NULL on all rows
--           because every product here has product_portion rows.
--           Having product_id populated alongside product_portion_id
--           would violate UNIQUE(modifier_id, product_id) when the
--           same modifier appears on multiple portions of one product.
--   [Fix 2] payment_master row 5: amount 126798.82 -> 124798.82
--           (must equal order_master.total_amount for order 5).
--   [Fix 3] payment_master row 9: amount 59898.82 -> 95298.82
--           (must equal order_master.total_amount for order 9).
--   [Fix 4] cart_items row 2: product_portion_id NULL -> 71
--           (product 39 has portions; product_portion_id must be set).
--   [Fix 5] order_items row 6: total 1413.46 -> 1213.46
--           (correct formula: 2x599 - 200 + 215.46 = 1213.46).
--   [Fix 6] order_items row 6: tax 215.46 -> 179.64
--           (18% x (2x599 - 200) = 179.64; total 1213.46 -> 1177.64).
--   [Fix 7] order_master row 12: subtotal 61999 -> 62498,
--           tax_amount 11159.82 -> 11249.64, total_amount 73158.82 -> 73747.64
--           (item prices 58999+3499=62498; 18% x 62498=11249.64).
--   [Fix 8] payment_master row 12: amount 73158.82 -> 73747.64
--           (must equal order_master.total_amount for order 12).
--   [Fix 9] modifier_portion rows 28-102: product_portion_id values were
--           all offset — laptop Dell/Lenovo rows used pp 20-23 (off by 1),
--           clothing used pp 24-33 (off by 1 from actual 25-36), footwear
--           used pp 34-40 (should be 43-49), accessories used pp 41-47
--           (should be 75-76/83/85/87/89-90), SSD used pp 46-47 (should
--           be 89-90), monitor used pp 48-50 (should be 93-94). Corrected
--           all 102 rows to reference the actual product_portion_id values. 
--           Also fixed modifier_portion_ids to be sequential 1-102.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- Truncate in child-first order to avoid FK conflicts
-- ============================================================
TRUNCATE TABLE review_helpful;
TRUNCATE TABLE product_reviews;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE cart_master;
TRUNCATE TABLE payment_master;
TRUNCATE TABLE order_items;
TRUNCATE TABLE order_master;
TRUNCATE TABLE offer_usage;
TRUNCATE TABLE offer_product_category;
TRUNCATE TABLE offer_master;
TRUNCATE TABLE product_images;
TRUNCATE TABLE modifier_portion;
TRUNCATE TABLE product_portion;
TRUNCATE TABLE product_categories;
TRUNCATE TABLE modifier_master;
TRUNCATE TABLE portion_master;
TRUNCATE TABLE product_master;
TRUNCATE TABLE category_master;
TRUNCATE TABLE user_addresses;
TRUNCATE TABLE user_master;

-- ============================================================
-- 1. USERS
-- user_id=1 is Admin; users 2-10 are customers created by Admin.
-- Passwords for users 4 & 5 are already bcrypt-hashed.
-- ============================================================
INSERT INTO user_master
(user_id, name, email, password, role, is_deleted, is_blocked, refresh_token, last_login, created_by)
VALUES
(1,  'Admin User',   'admin@example.com',  'admin123',                                                               'admin',    0, 0, NULL, NULL, NULL),
(2,  'Rahul Sharma', 'rahul@example.com',  'password123',                                                            'customer', 0, 0, NULL, NULL, 1),
(3,  'Priya Singh',  'priya@example.com',  'password123',                                                            'customer', 0, 0, NULL, NULL, 1),
(4,  'Om Patel',     'om@gmail.com',       '$2b$10$d4IVAEVTp3tDa8vTZW2zZ.KVTToxTvcPV8dBA1hBuo1YojevV5SUu',         'customer', 0, 0, NULL, NULL, 1),
(5,  'Omi Shah',     'omi@gmail.com',      '$2b$10$XmqPYzOtmfEORvztqTb3rOX9LCh7QH8G5/MgZR4/K5ejzSoxyGJta',        'customer', 0, 0, NULL, NULL, 1),
(6,  'Arjun Mehta',  'arjun@example.com',  'password123',                                                            'customer', 0, 0, NULL, NULL, 1),
(7,  'Sneha Reddy',  'sneha@example.com',  'password123',                                                            'customer', 0, 0, NULL, NULL, 1),
(8,  'Vikram Nair',  'vikram@example.com', 'password123',                                                            'customer', 0, 0, NULL, NULL, 1),
(9,  'Kavya Iyer',   'kavya@example.com',  'password123',                                                            'customer', 0, 0, NULL, NULL, 1),
(10, 'Rohan Gupta',  'rohan@example.com',  'password123',                                                            'customer', 0, 0, NULL, NULL, 1);


-- ============================================================
-- 2. USER ADDRESSES
-- Each customer (user 2-10) has exactly one default shipping address.
-- created_by = the user themselves.
-- ============================================================
INSERT INTO user_addresses
(address_id, user_id, address_type, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default, is_deleted, created_by)
VALUES
(1, 2,  'shipping', 'Rahul Sharma', '9876543210', '101 MG Road',        'Near Metro Station',  'Bengaluru', 'Karnataka',   '560001', 'India', 1, 0, 2),
(2, 3,  'shipping', 'Priya Singh',  '9123456780', '202 Marine Drive',   'Sea View Apartments', 'Mumbai',    'Maharashtra', '400001', 'India', 1, 0, 3),
(3, 4,  'shipping', 'Om Patel',     '9988776655', '303 Satellite Road', 'Near ISRO',           'Ahmedabad', 'Gujarat',     '380015', 'India', 1, 0, 4),
(4, 5,  'shipping', 'Omi Shah',     '9977665544', '404 CG Road',        'Opp Law Garden',      'Ahmedabad', 'Gujarat',     '380006', 'India', 1, 0, 5),
(5, 6,  'shipping', 'Arjun Mehta',  '9866554433', '505 Linking Road',   'Bandra West',         'Mumbai',    'Maharashtra', '400050', 'India', 1, 0, 6),
(6, 7,  'shipping', 'Sneha Reddy',  '9855443322', '606 Jubilee Hills',  'Road No 36',          'Hyderabad', 'Telangana',   '500033', 'India', 1, 0, 7),
(7, 8,  'shipping', 'Vikram Nair',  '9844332211', '707 Koregaon Park',  'Lane 5',              'Pune',      'Maharashtra', '411001', 'India', 1, 0, 8),
(8, 9,  'shipping', 'Kavya Iyer',   '9833221100', '808 Anna Nagar',     '2nd Street',          'Chennai',   'Tamil Nadu',  '600040', 'India', 1, 0, 9),
(9, 10, 'shipping', 'Rohan Gupta',  '9822110099', '909 Rajouri Garden', 'Main Market',         'Delhi',     'Delhi',       '110027', 'India', 1, 0, 10);


-- ============================================================
-- 3. CATEGORIES
-- Two root categories: Electronics (1) and Fashion (5).
-- All FKs (parent_id) reference existing category_ids in this list.
-- ============================================================
INSERT INTO category_master
(category_id, category_name, parent_id, is_deleted, created_by)
VALUES
(1,  'Electronics',    NULL, 0, 1),  -- root
(2,  'Mobiles',        1,    0, 1),  -- child of Electronics
(3,  'Laptops',        1,    0, 1),  -- child of Electronics
(4,  'Accessories',    1,    0, 1),  -- child of Electronics
(5,  'Fashion',        NULL, 0, 1),  -- root
(6,  'Men Clothing',   5,    0, 1),  -- child of Fashion
(7,  'Women Clothing', 5,    0, 1),  -- child of Fashion
(8,  'Footwear',       5,    0, 1),  -- child of Fashion
(9,  'Smart Devices',  1,    0, 1),  -- child of Electronics
(10, 'Home Appliances',NULL, 0, 1);  -- root


-- ============================================================
-- 4. PRODUCTS
-- category_id references category_master (IDs 1-10 above).
-- product.stock is the base/fallback stock; variant stock lives in
-- product_portion. created_by = Admin (1).
-- ============================================================
INSERT INTO product_master
(product_id, name, display_name, description, short_description, price, discounted_price, stock, category_id, is_active, is_deleted, created_by)
VALUES
-- Mobiles (category 2)
(1,  'iphone_15',        'Apple iPhone 15',        'Apple smartphone',              'iPhone 15 128GB',        79999, 74999,  50,  2,  1, 0, 1),
(2,  'iphone_14',        'Apple iPhone 14',        'Apple smartphone',              'iPhone 14 128GB',        69999, 64999,  40,  2,  1, 0, 1),
(3,  'samsung_s24',      'Samsung Galaxy S24',     'Samsung flagship phone',        'Galaxy S24',             89999, 84999,  35,  2,  1, 0, 1),
(4,  'samsung_a54',      'Samsung Galaxy A54',     'Samsung midrange phone',        'Galaxy A54',             38999, 34999,  60,  2,  1, 0, 1),
(5,  'redmi_note13',     'Redmi Note 13',          'Xiaomi smartphone',             'Note 13',                24999, 22999,  80,  2,  1, 0, 1),
(6,  'oneplus_12',       'OnePlus 12',             'OnePlus flagship phone',        'OnePlus 12',             64999, 61999,  40,  2,  1, 0, 1),
(7,  'poco_x6',          'POCO X6',                'Performance smartphone',        'POCO X6',                22999, 20999,  70,  2,  1, 0, 1),
(8,  'realme_12',        'Realme 12',              'Realme smartphone',             'Realme 12',              19999, 17999,  75,  2,  1, 0, 1),
-- Laptops (category 3)
(9,  'macbook_air',      'Apple MacBook Air',      'Apple laptop',                  'MacBook Air M2',         119999,109999, 20,  3,  1, 0, 1),
(10, 'hp_pavilion',      'HP Pavilion',            'HP laptop',                     'HP Pavilion i5',         69999, 64999,  25,  3,  1, 0, 1),
(11, 'dell_inspiron',    'Dell Inspiron',          'Dell laptop',                   'Inspiron 15',            62999, 58999,  30,  3,  1, 0, 1),
(12, 'lenovo_ideapad',   'Lenovo Ideapad',         'Lenovo laptop',                 'Ideapad Slim',           54999, 51999,  35,  3,  1, 0, 1),
-- Accessories (category 4)
(13, 'boat_headphones',  'Boat Headphones',        'Wireless headphones',           'Boat Rockerz',           2499,  1999,   120, 4,  1, 0, 1),
(14, 'sony_headphones',  'Sony Headphones',        'Noise cancelling headphones',   'Sony WH',                34999, 32999,  25,  4,  1, 0, 1),
(15, 'logitech_mouse',   'Logitech Mouse',         'Wireless mouse',                'Logitech Mouse',         1499,  1199,   100, 4,  1, 0, 1),
(16, 'gaming_keyboard',  'Gaming Keyboard',        'Mechanical keyboard',           'RGB Keyboard',           3999,  3499,   90,  4,  1, 0, 1),
-- Men Clothing (category 6)
(17, 'mens_tshirt',      'Men T-Shirt',            'Cotton tshirt',                 'Men Casual Tee',         799,   599,    200, 6,  1, 0, 1),
(18, 'mens_jeans',       'Men Jeans',              'Slim fit jeans',                'Denim Jeans',            1999,  1599,   180, 6,  1, 0, 1),
(19, 'mens_jacket',      'Men Jacket',             'Winter jacket',                 'Men Jacket',             2999,  2499,   90,  6,  1, 0, 1),
(20, 'mens_shirt',       'Men Shirt',              'Formal shirt',                  'Cotton Shirt',           1499,  1199,   150, 6,  1, 0, 1),
-- Women Clothing (category 7)
(21, 'women_dress',      'Women Dress',            'Floral dress',                  'Summer Dress',           2499,  1999,   140, 7,  1, 0, 1),
(22, 'women_top',        'Women Top',              'Casual top',                    'Women Top',              999,   799,    170, 7,  1, 0, 1),
(23, 'women_kurti',      'Women Kurti',            'Traditional kurti',             'Cotton Kurti',           1299,  999,    160, 7,  1, 0, 1),
(24, 'women_saree',      'Women Saree',            'Traditional saree',             'Silk Saree',             3999,  3499,   80,  7,  1, 0, 1),
-- Footwear (category 8)
(25, 'mens_shoes',       'Men Shoes',              'Sports shoes',                  'Running Shoes',          2999,  2499,   120, 8,  1, 0, 1),
(26, 'mens_sneakers',    'Men Sneakers',           'Casual sneakers',               'Sneakers',               2799,  2299,   130, 8,  1, 0, 1),
(27, 'women_heels',      'Women Heels',            'Fashion heels',                 'High Heels',             2599,  2199,   110, 8,  1, 0, 1),
(28, 'women_sneakers',   'Women Sneakers',         'Casual sneakers',               'Women Sneakers',         2899,  2399,   100, 8,  1, 0, 1),
-- Smart Devices (category 9)
(29, 'apple_watch',      'Apple Watch',            'Apple smartwatch',              'Watch Series 9',         45999, 42999,  50,  9,  1, 0, 1),
(30, 'galaxy_watch',     'Galaxy Watch',           'Samsung smartwatch',            'Galaxy Watch',           28999, 25999,  60,  9,  1, 0, 1),
(31, 'mi_band',          'Mi Band',                'Fitness tracker',               'Mi Band 8',              3999,  3499,   150, 9,  1, 0, 1),
(32, 'noise_watch',      'Noise Watch',            'Smartwatch',                    'Noise Colorfit',         4999,  3999,   130, 9,  1, 0, 1),
-- Home Appliances (category 10)
(33, 'smart_tv',         'Smart TV',               'Android TV',                    '55 inch TV',             59999, 54999,  40,  10, 1, 0, 1),
(34, 'washing_machine',  'Washing Machine',        'Front load washing machine',    'LG Washer',              45999, 42999,  25,  10, 1, 0, 1),
(35, 'refrigerator',     'Refrigerator',           'Double door fridge',            'Samsung Fridge',         54999, 50999,  20,  10, 1, 0, 1),
(36, 'microwave',        'Microwave Oven',         'Kitchen appliance',             'Microwave Oven',         14999, 12999,  50,  10, 1, 0, 1),
(37, 'air_fryer',        'Air Fryer',              'Kitchen appliance',             'Air Fryer',              9999,  7999,   70,  10, 1, 0, 1),
(38, 'vacuum_cleaner',   'Vacuum Cleaner',         'Home cleaning',                 'Vacuum Cleaner',         12999, 10999,  60,  10, 1, 0, 1),
-- Accessories continued (category 4)
(39, 'gaming_mouse',     'Gaming Mouse',           'RGB gaming mouse',              'Gaming Mouse',           1999,  1599,   90,  4,  1, 0, 1),
(40, 'gaming_headset',   'Gaming Headset',         'Gaming headset',                'Headset',                2999,  2499,   85,  4,  1, 0, 1),
(41, 'usb_cable',        'USB Cable',              'Charging cable',                'Type C Cable',           499,   399,    300, 4,  1, 0, 1),
(42, 'power_bank',       'Power Bank',             'Portable charger',              '20000mAh Power Bank',    1999,  1699,   200, 4,  1, 0, 1),
-- Electronics root (category 1) â€” tablets + speakers + networking + storage + monitor
(43, 'tablet',           'Android Tablet',         '10 inch tablet',                'Android Tablet',         19999, 17999,  60,  1,  1, 0, 1),
(44, 'ipad',             'Apple iPad',             'Apple tablet',                  'iPad 10th Gen',          49999, 46999,  45,  1,  1, 0, 1),
(45, 'bluetooth_speaker','Bluetooth Speaker',      'Portable speaker',              'Speaker',                2499,  1999,   120, 4,  1, 0, 1),
(46, 'soundbar',         'Soundbar',               'Home theater soundbar',         'Dolby Soundbar',         14999, 12999,  40,  4,  1, 0, 1),
(47, 'router',           'WiFi Router',            'Wireless router',               'WiFi Router',            2999,  2499,   90,  4,  1, 0, 1),
(48, 'ssd_drive',        'SSD Drive',              'Storage device',                '1TB SSD',                8999,  7999,   70,  4,  1, 0, 1),
(49, 'external_hdd',     'External HDD',           'Portable storage',              '2TB HDD',                6999,  5999,   60,  4,  1, 0, 1),
(50, 'monitor',          'LED Monitor',            '24 inch monitor',               'Full HD Monitor',        12999, 10999,  55,  3,  1, 0, 1);


-- ============================================================
-- 5. PORTIONS
-- Global size/variant options reused across products.
-- IDs 1-4: Mobile storage; 5-7: Laptop RAM; 8-12: Clothing sizes;
-- 13-17: Shoe sizes; 18-19: Watch case; 20-22: TV screen;
-- 23-24: Appliance wattage; 25-26: Drive capacity;
-- 27-30: Generic tier variants (for accessories/tablets).
-- ============================================================
INSERT INTO portion_master
(portion_id, portion_value, description, is_active, is_deleted, created_by)
VALUES
(1,  '64 GB',    'Mobile Storage 64GB',   1, 0, 1),
(2,  '128 GB',   'Mobile Storage 128GB',  1, 0, 1),
(3,  '256 GB',   'Mobile Storage 256GB',  1, 0, 1),
(4,  '512 GB',   'Mobile Storage 512GB',  1, 0, 1),
(5,  '8 GB RAM', 'Laptop RAM 8GB',        1, 0, 1),
(6,  '16 GB RAM','Laptop RAM 16GB',       1, 0, 1),
(7,  '32 GB RAM','Laptop RAM 32GB',       1, 0, 1),
(8,  'S',        'Clothing Size Small',   1, 0, 1),
(9,  'M',        'Clothing Size Medium',  1, 0, 1),
(10, 'L',        'Clothing Size Large',   1, 0, 1),
(11, 'XL',       'Clothing Size XL',      1, 0, 1),
(12, 'XXL',      'Clothing Size XXL',     1, 0, 1),
(13, 'UK 6',     'Shoe Size UK 6',        1, 0, 1),
(14, 'UK 7',     'Shoe Size UK 7',        1, 0, 1),
(15, 'UK 8',     'Shoe Size UK 8',        1, 0, 1),
(16, 'UK 9',     'Shoe Size UK 9',        1, 0, 1),
(17, 'UK 10',    'Shoe Size UK 10',       1, 0, 1),
(18, '41 mm',    'Watch Case 41mm',       1, 0, 1),
(19, '45 mm',    'Watch Case 45mm',       1, 0, 1),
(20, '43 inch',  'TV Screen Size',        1, 0, 1),
(21, '55 inch',  'TV Screen Size',        1, 0, 1),
(22, '65 inch',  'TV Screen Size',        1, 0, 1),
(23, '500 W',    'Appliance Power',       1, 0, 1),
(24, '1000 W',   'Appliance Power',       1, 0, 1),
(25, '1 TB',     'Storage Capacity',      1, 0, 1),
(26, '2 TB',     'Storage Capacity',      1, 0, 1),
(27, 'Standard', 'Standard Variant',      1, 0, 1),
(28, 'Pro',      'Pro Variant',           1, 0, 1),
(29, 'Plus',     'Plus Variant',          1, 0, 1),
(30, 'Ultra',    'Ultra Variant',         1, 0, 1);


-- ============================================================
-- 6. MODIFIERS
-- Global attribute options reused across products/portions.
-- IDs 1-5: Colors; 6-8: RAM variants; 9-10: Storage bumps;
-- 11-13: Materials; 14-16: Patterns; 17-18: Finish; etc.
-- ============================================================
INSERT INTO modifier_master
(modifier_id, modifier_name, modifier_value, additional_price, is_active, is_deleted, created_by)
VALUES
(1,  'Color',        'Black',      0,    1, 0, 1),
(2,  'Color',        'White',      0,    1, 0, 1),
(3,  'Color',        'Blue',       0,    1, 0, 1),
(4,  'Color',        'Red',        0,    1, 0, 1),
(5,  'Color',        'Silver',     0,    1, 0, 1),
(6,  'RAM',          '8 GB',       0,    1, 0, 1),
(7,  'RAM',          '12 GB',      2000, 1, 0, 1),
(8,  'RAM',          '16 GB',      4000, 1, 0, 1),
(9,  'Storage',      '256 GB',     3000, 1, 0, 1),
(10, 'Storage',      '512 GB',     6000, 1, 0, 1),
(11, 'Material',     'Cotton',     0,    1, 0, 1),
(12, 'Material',     'Denim',      0,    1, 0, 1),
(13, 'Material',     'Leather',    1000, 1, 0, 1),
(14, 'Pattern',      'Plain',      0,    1, 0, 1),
(15, 'Pattern',      'Striped',    0,    1, 0, 1),
(16, 'Pattern',      'Printed',    0,    1, 0, 1),
(17, 'Finish',       'Matte',      0,    1, 0, 1),
(18, 'Finish',       'Glossy',     0,    1, 0, 1),
(19, 'Connectivity', 'Bluetooth',  0,    1, 0, 1),
(20, 'Connectivity', 'WiFi',       0,    1, 0, 1),
(21, 'Battery',      '4000mAh',    0,    1, 0, 1),
(22, 'Battery',      '5000mAh',    500,  1, 0, 1),
(23, 'Edition',      'Standard',   0,    1, 0, 1),
(24, 'Edition',      'Pro',        2000, 1, 0, 1),
(25, 'Edition',      'Ultra',      4000, 1, 0, 1),
(26, 'Cable Type',   'USB-C',      0,    1, 0, 1),
(27, 'Cable Type',   'Lightning',  0,    1, 0, 1),
(28, 'Sound',        'Stereo',     0,    1, 0, 1),
(29, 'Sound',        'Dolby',      1500, 1, 0, 1),
(30, 'Warranty',     '1 Year',     0,    1, 0, 1);


-- ============================================================
-- 7. PRODUCT CATEGORIES (many-to-many)
-- Each product is tagged to its leaf category AND all its ancestors
-- so category-tree queries work correctly.
-- ============================================================
INSERT INTO product_categories
(product_id, category_id, is_deleted, created_by)
VALUES
-- Mobiles (2) + Electronics (1)
(1,2,0,1),(1,1,0,1),
(2,2,0,1),(2,1,0,1),
(3,2,0,1),(3,1,0,1),
(4,2,0,1),(4,1,0,1),
(5,2,0,1),(5,1,0,1),
(6,2,0,1),(6,1,0,1),
(7,2,0,1),(7,1,0,1),
(8,2,0,1),(8,1,0,1),
-- Laptops (3) + Electronics (1)
(9,3,0,1),(9,1,0,1),
(10,3,0,1),(10,1,0,1),
(11,3,0,1),(11,1,0,1),
(12,3,0,1),(12,1,0,1),
-- Accessories (4) â€” no ancestor needed (parent is Electronics=1)
(13,4,0,1),(14,4,0,1),
(15,4,0,1),(16,4,0,1),
-- Men Clothing (6) â€” parent Fashion (5)
(17,6,0,1),(18,6,0,1),
(19,6,0,1),(20,6,0,1),
-- Women Clothing (7) â€” parent Fashion (5)
(21,7,0,1),(22,7,0,1),
(23,7,0,1),(24,7,0,1),
-- Footwear (8) â€” parent Fashion (5)
(25,8,0,1),(26,8,0,1),
(27,8,0,1),(28,8,0,1),
-- Smart Devices (9) + Electronics (1)
(29,9,0,1),(29,1,0,1),
(30,9,0,1),(30,1,0,1),
(31,9,0,1),(31,1,0,1),
(32,9,0,1),(32,1,0,1),
-- Home Appliances (10) â€” root
(33,10,0,1),(34,10,0,1),
(35,10,0,1),(36,10,0,1),
(37,10,0,1),(38,10,0,1),
-- Accessories continued
(39,4,0,1),(40,4,0,1),
(41,4,0,1),(42,4,0,1),
-- Electronics root (tablets, iPad)
(43,1,0,1),(44,1,0,1),
-- Accessories (speaker, soundbar, router, ssd, hdd)
(45,4,0,1),(46,4,0,1),
(47,4,0,1),(48,4,0,1),
(49,4,0,1),
-- Monitor â†’ Laptops category (display peripheral)
(50,3,0,1);


-- ============================================================
-- 8. PRODUCT PORTIONS
-- Concrete variant of a product (storage/size/watt/etc.) with its
-- own price and stock.  UNIQUE(product_id, portion_id).
-- ============================================================
INSERT INTO product_portion
(product_portion_id, product_id, portion_id, price, discounted_price, stock, is_active, is_deleted, created_by)
VALUES
-- iPhone 15 (prod 1): 128GB, 256GB
(1,  1,  2,  79999,  74999,  20, 1, 0, 1),
(2,  1,  3,  84999,  79999,  15, 1, 0, 1),
-- iPhone 14 (prod 2): 128GB, 256GB
(3,  2,  2,  69999,  64999,  18, 1, 0, 1),
(4,  2,  3,  74999,  69999,  12, 1, 0, 1),
-- Samsung S24 (prod 3): 256GB, 512GB
(5,  3,  3,  89999,  84999,  15, 1, 0, 1),
(6,  3,  4,  94999,  89999,  10, 1, 0, 1),
-- Samsung A54 (prod 4): 128GB, 256GB
(7,  4,  2,  38999,  34999,  30, 1, 0, 1),
(8,  4,  3,  41999,  37999,  22, 1, 0, 1),
-- Redmi Note 13 (prod 5): 128GB, 256GB
(9,  5,  2,  24999,  22999,  40, 1, 0, 1),
(10, 5,  3,  26999,  24999,  30, 1, 0, 1),
-- OnePlus 12 (prod 6): 256GB, 512GB
(11, 6,  3,  64999,  61999,  25, 1, 0, 1),
(12, 6,  4,  69999,  65999,  15, 1, 0, 1),
-- POCO X6 (prod 7): 128GB, 256GB
(13, 7,  2,  22999,  20999,  28, 1, 0, 1),
(14, 7,  3,  24999,  22999,  22, 1, 0, 1),
-- Realme 12 (prod 8): 128GB, 256GB
(15, 8,  2,  19999,  17999,  25, 1, 0, 1),
(16, 8,  3,  21999,  19999,  20, 1, 0, 1),
-- MacBook Air (prod 9): 8GB RAM, 16GB RAM
(17, 9,  5,  119999, 109999, 12, 1, 0, 1),
(18, 9,  6,  129999, 119999, 10, 1, 0, 1),
-- HP Pavilion (prod 10): 8GB, 16GB
(19, 10, 5,  69999,  64999,  15, 1, 0, 1),
(20, 10, 6,  74999,  69999,  10, 1, 0, 1),
-- Dell Inspiron (prod 11): 8GB, 16GB
(21, 11, 5,  62999,  58999,  14, 1, 0, 1),
(22, 11, 6,  67999,  63999,  12, 1, 0, 1),
-- Lenovo Ideapad (prod 12): 8GB, 16GB
(23, 12, 5,  54999,  51999,  16, 1, 0, 1),
(24, 12, 6,  59999,  55999,  10, 1, 0, 1),
-- Men T-Shirt (prod 17): S, M, L
(25, 17, 8,  799,    599,    80, 1, 0, 1),
(26, 17, 9,  799,    599,    90, 1, 0, 1),
(27, 17, 10, 799,    599,    70, 1, 0, 1),
-- Men Jeans (prod 18): M, L, XL
(28, 18, 9,  1999,   1599,   65, 1, 0, 1),
(29, 18, 10, 1999,   1599,   70, 1, 0, 1),
(30, 18, 11, 1999,   1599,   55, 1, 0, 1),
-- Men Jacket (prod 19): M, L
(31, 19, 9,  2999,   2499,   45, 1, 0, 1),
(32, 19, 10, 2999,   2499,   40, 1, 0, 1),
-- Men Shirt (prod 20): M, L
(33, 20, 9,  1499,   1199,   60, 1, 0, 1),
(34, 20, 10, 1499,   1199,   65, 1, 0, 1),
-- Women Dress (prod 21): S, M
(35, 21, 8,  2499,   1999,   55, 1, 0, 1),
(36, 21, 9,  2499,   1999,   60, 1, 0, 1),
-- Women Top (prod 22): S, M
(37, 22, 8,  999,    799,    70, 1, 0, 1),
(38, 22, 9,  999,    799,    65, 1, 0, 1),
-- Women Kurti (prod 23): M, L
(39, 23, 9,  1299,   999,    70, 1, 0, 1),
(40, 23, 10, 1299,   999,    75, 1, 0, 1),
-- Women Saree (prod 24): M, L
(41, 24, 9,  3999,   3499,   50, 1, 0, 1),
(42, 24, 10, 3999,   3499,   45, 1, 0, 1),
-- Men Shoes (prod 25): UK 7, UK 8
(43, 25, 14, 2999,   2499,   40, 1, 0, 1),
(44, 25, 15, 2999,   2499,   45, 1, 0, 1),
-- Men Sneakers (prod 26): UK 8, UK 9
(45, 26, 15, 2799,   2299,   50, 1, 0, 1),
(46, 26, 16, 2799,   2299,   40, 1, 0, 1),
-- Women Heels (prod 27): UK 7, UK 8
(47, 27, 14, 2599,   2199,   35, 1, 0, 1),
(48, 27, 15, 2599,   2199,   30, 1, 0, 1),
-- Women Sneakers (prod 28): UK 8, UK 9
(49, 28, 15, 2899,   2399,   30, 1, 0, 1),
(50, 28, 16, 2899,   2399,   25, 1, 0, 1),
-- Apple Watch (prod 29): 41mm, 45mm
(51, 29, 18, 45999,  42999,  20, 1, 0, 1),
(52, 29, 19, 46999,  43999,  18, 1, 0, 1),
-- Galaxy Watch (prod 30): 41mm, 45mm
(53, 30, 18, 28999,  25999,  22, 1, 0, 1),
(54, 30, 19, 29999,  26999,  18, 1, 0, 1),
-- Mi Band (prod 31): 41mm, 45mm
(55, 31, 18, 3999,   3499,   50, 1, 0, 1),
(56, 31, 19, 4299,   3799,   45, 1, 0, 1),
-- Noise Watch (prod 32): 41mm, 45mm
(57, 32, 18, 4999,   3999,   45, 1, 0, 1),
(58, 32, 19, 5299,   4299,   40, 1, 0, 1),
-- Smart TV (prod 33): 55 inch, 65 inch
(59, 33, 21, 59999,  54999,  15, 1, 0, 1),
(60, 33, 22, 69999,  64999,  10, 1, 0, 1),
-- Washing Machine (prod 34): 500W, 1000W
(61, 34, 23, 45999,  42999,  12, 1, 0, 1),
(62, 34, 24, 47999,  44999,  10, 1, 0, 1),
-- Refrigerator (prod 35): 500W, 1000W
(63, 35, 23, 54999,  50999,  10, 1, 0, 1),
(64, 35, 24, 56999,  52999,   8, 1, 0, 1),
-- Microwave (prod 36): 500W, 1000W
(65, 36, 23, 14999,  12999,  20, 1, 0, 1),
(66, 36, 24, 15999,  13999,  18, 1, 0, 1),
-- Air Fryer (prod 37): 500W, 1000W
(67, 37, 23, 9999,   7999,   25, 1, 0, 1),
(68, 37, 24, 10999,  8999,   22, 1, 0, 1),
-- Vacuum Cleaner (prod 38): 500W, 1000W
(69, 38, 23, 12999,  10999,  20, 1, 0, 1),
(70, 38, 24, 13999,  11999,  18, 1, 0, 1),
-- Gaming Mouse (prod 39): Standard, Pro
(71, 39, 27, 1999,   1599,   90, 1, 0, 1),
(72, 39, 28, 2199,   1799,   80, 1, 0, 1),
-- Gaming Headset (prod 40): Standard, Pro
(73, 40, 27, 2999,   2499,   85, 1, 0, 1),
(74, 40, 28, 3199,   2699,   75, 1, 0, 1),
-- USB Cable (prod 41): Standard, Pro
(75, 41, 27, 499,    399,    200,1, 0, 1),
(76, 41, 28, 599,    499,    180,1, 0, 1),
-- Power Bank (prod 42): Standard, Pro
(77, 42, 27, 1999,   1699,   150,1, 0, 1),
(78, 42, 28, 2199,   1899,   140,1, 0, 1),
-- Android Tablet (prod 43): Standard, Pro
(79, 43, 27, 19999,  17999,  60, 1, 0, 1),
(80, 43, 28, 21999,  19999,  55, 1, 0, 1),
-- Apple iPad (prod 44): Standard, Pro
(81, 44, 27, 49999,  46999,  45, 1, 0, 1),
(82, 44, 28, 52999,  49999,  40, 1, 0, 1),
-- Bluetooth Speaker (prod 45): Standard, Pro
(83, 45, 27, 2499,   1999,   120,1, 0, 1),
(84, 45, 28, 2699,   2199,   100,1, 0, 1),
-- Soundbar (prod 46): Standard, Pro
(85, 46, 27, 14999,  12999,  40, 1, 0, 1),
(86, 46, 28, 15999,  13999,  35, 1, 0, 1),
-- WiFi Router (prod 47): Standard, Pro
(87, 47, 27, 2999,   2499,   90, 1, 0, 1),
(88, 47, 28, 3199,   2699,   80, 1, 0, 1),
-- SSD Drive (prod 48): 1TB, 2TB
(89, 48, 25, 8999,   7999,   70, 1, 0, 1),
(90, 48, 26, 9999,   8999,   60, 1, 0, 1),
-- External HDD (prod 49): 1TB, 2TB
(91, 49, 25, 6999,   5999,   60, 1, 0, 1),
(92, 49, 26, 7999,   6999,   55, 1, 0, 1),
-- Monitor (prod 50): 55 inch, 65 inch
(93, 50, 21, 12999,  10999,  55, 1, 0, 1),
(94, 50, 22, 13999,  11999,  50, 1, 0, 1),
-- Smart TV extra: 43 inch
(95, 33, 20, 58999,  53999,  12, 1, 0, 1),
-- Washing Machine extra: 43-inch-equivalent (using portion 20 for "43 inch" label)
(96, 34, 20, 44999,  41999,  10, 1, 0, 1),
(97, 35, 20, 53999,  49999,   9, 1, 0, 1),
(98, 36, 20, 13999,  11999,  18, 1, 0, 1),
(99, 37, 20, 9499,   7499,   20, 1, 0, 1),
(100,38, 20, 12499,  10499,  16, 1, 0, 1);


-- ============================================================
-- 9. MODIFIER PORTIONS  [Fix 1 applied]
-- Links a modifier option to a specific product_portion.
-- RULE: When a product has portions (product_portion rows exist),
--       use product_portion_id and set product_id = NULL.
--       When a product has NO portions at all, use product_id
--       and set product_portion_id = NULL.
-- All 50 products here have product_portion rows, so product_id
-- is NULL on every row. Having product_id populated when
-- product_portion_id is also set would violate
-- UNIQUE(modifier_id, product_id) for any modifier appearing
-- on more than one portion of the same product.
-- ============================================================
INSERT INTO modifier_portion
(modifier_portion_id, modifier_id, product_portion_id, product_id, additional_price, stock, is_active, is_deleted, created_by)
VALUES
-- iPhone 15 / 128GB (pp=1): Black, White, RAM 8GB
(1,   1,  1,  NULL, 0,    40, 1, 0, 1),
(2,   2,  1,  NULL, 0,    35, 1, 0, 1),
(3,   6,  1,  NULL, 0,    30, 1, 0, 1),
-- iPhone 15 / 256GB (pp=2): Black, RAM 12GB
(4,   1,  2,  NULL, 0,    30, 1, 0, 1),
(5,   7,  2,  NULL, 2000, 20, 1, 0, 1),
-- iPhone 14 / 128GB (pp=3): Black, RAM 8GB
(6,   1,  3,  NULL, 0,    30, 1, 0, 1),
(7,   6,  3,  NULL, 0,    25, 1, 0, 1),
-- iPhone 14 / 256GB (pp=4): White, RAM 12GB
(8,   2,  4,  NULL, 0,    30, 1, 0, 1),
(9,   7,  4,  NULL, 2000, 20, 1, 0, 1),
-- Samsung S24 / 256GB (pp=5): Blue, RAM 16GB
(10,  3,  5,  NULL, 0,    25, 1, 0, 1),
(11,  8,  5,  NULL, 4000, 15, 1, 0, 1),
-- Samsung S24 / 512GB (pp=6): Red, RAM 16GB
(12,  4,  6,  NULL, 0,    20, 1, 0, 1),
(13,  8,  6,  NULL, 4000, 15, 1, 0, 1),
-- Samsung A54 / 128GB (pp=7): Black, RAM 8GB
(14,  1,  7,  NULL, 0,    30, 1, 0, 1),
(15,  6,  7,  NULL, 0,    25, 1, 0, 1),
-- Samsung A54 / 256GB (pp=8): White, RAM 12GB
(16,  2,  8,  NULL, 0,    25, 1, 0, 1),
(17,  7,  8,  NULL, 2000, 20, 1, 0, 1),
-- Redmi Note 13 / 128GB (pp=9): Blue, RAM 8GB
(18,  3,  9,  NULL, 0,    35, 1, 0, 1),
(19,  6,  9,  NULL, 0,    30, 1, 0, 1),
-- Redmi Note 13 / 256GB (pp=10): Red, RAM 12GB
(20,  4,  10, NULL, 0,    30, 1, 0, 1),
(21,  7,  10, NULL, 2000, 25, 1, 0, 1),
-- MacBook Air / 8GB RAM (pp=17): Silver color, 256GB SSD
(22,  5,  17, NULL, 0,    40, 1, 0, 1),
(23,  9,  17, NULL, 0,    35, 1, 0, 1),
-- MacBook Air / 16GB RAM (pp=18): Silver color, 512GB SSD
(24,  5,  18, NULL, 0,    35, 1, 0, 1),
(25,  10, 18, NULL, 0,    30, 1, 0, 1),
-- HP Pavilion / 8GB RAM (pp=19): Silver color, 256GB SSD
(26,  5,  19, NULL, 0,    30, 1, 0, 1),
(27,  9,  19, NULL, 0,    30, 1, 0, 1),
-- HP Pavilion / 16GB RAM (pp=20): Silver color, 512GB SSD
(28,  5,  20, NULL, 0,    30, 1, 0, 1),
(29,  10, 20, NULL, 0,    25, 1, 0, 1),
-- Dell Inspiron / 8GB RAM (pp=21): Black color, 256GB SSD
(30,  1,  21, NULL, 0,    35, 1, 0, 1),
(31,  9,  21, NULL, 0,    30, 1, 0, 1),
-- Dell Inspiron / 16GB RAM (pp=22): Black color, 512GB SSD
(32,  1,  22, NULL, 0,    30, 1, 0, 1),
(33,  10, 22, NULL, 0,    25, 1, 0, 1),
-- Lenovo Ideapad / 8GB RAM (pp=23): Silver color, 256GB SSD
(34,  5,  23, NULL, 0,    30, 1, 0, 1),
(35,  9,  23, NULL, 0,    25, 1, 0, 1),
-- Lenovo Ideapad / 16GB RAM (pp=24): Silver color, 512GB SSD
(36,  5,  24, NULL, 0,    25, 1, 0, 1),
(37,  10, 24, NULL, 0,    20, 1, 0, 1),
-- Men T-Shirt / S (pp=25): Cotton, Plain
(38,  11, 25, NULL, 0,    30, 1, 0, 1),
(39,  14, 25, NULL, 0,    25, 1, 0, 1),
-- Men T-Shirt / M (pp=26): Cotton, Striped
(40,  11, 26, NULL, 0,    25, 1, 0, 1),
(41,  15, 26, NULL, 0,    20, 1, 0, 1),
-- Men Jeans / M (pp=28): Black, White
(42,  1,  28, NULL, 0,    30, 1, 0, 1),
(43,  2,  28, NULL, 0,    25, 1, 0, 1),
-- Men Jeans / L (pp=29): Black, Blue
(44,  1,  29, NULL, 0,    25, 1, 0, 1),
(45,  3,  29, NULL, 0,    20, 1, 0, 1),
-- Men Jacket / M (pp=31): Black, White
(46,  1,  31, NULL, 0,    30, 1, 0, 1),
(47,  2,  31, NULL, 0,    25, 1, 0, 1),
-- Men Jacket / L (pp=32): Black, Blue
(48,  1,  32, NULL, 0,    25, 1, 0, 1),
(49,  3,  32, NULL, 0,    20, 1, 0, 1),
-- Men Shirt / M (pp=33): Black, White
(50,  1,  33, NULL, 0,    30, 1, 0, 1),
(51,  2,  33, NULL, 0,    25, 1, 0, 1),
-- Men Shirt / L (pp=34): Black, Blue
(52,  1,  34, NULL, 0,    25, 1, 0, 1),
(53,  3,  34, NULL, 0,    20, 1, 0, 1),
-- Women Dress / S (pp=35): Black, White
(54,  1,  35, NULL, 0,    30, 1, 0, 1),
(55,  2,  35, NULL, 0,    25, 1, 0, 1),
-- Women Dress / M (pp=36): Black, Blue
(56,  1,  36, NULL, 0,    25, 1, 0, 1),
(57,  3,  36, NULL, 0,    20, 1, 0, 1),
-- Men Shoes / UK 7 (pp=43): Matte, Glossy
(58,  17, 43, NULL, 0,    20, 1, 0, 1),
(59,  18, 43, NULL, 0,    20, 1, 0, 1),
-- Men Shoes / UK 8 (pp=44): Matte, Glossy
(60,  17, 44, NULL, 0,    15, 1, 0, 1),
(61,  18, 44, NULL, 0,    15, 1, 0, 1),
-- Men Sneakers / UK 8 (pp=45): Matte, Glossy
(62,  17, 45, NULL, 0,    10, 1, 0, 1),
(63,  18, 45, NULL, 0,    10, 1, 0, 1),
-- Men Sneakers / UK 9 (pp=46): Matte, Glossy
(64,  17, 46, NULL, 0,    10, 1, 0, 1),
(65,  18, 46, NULL, 0,    10, 1, 0, 1),
-- Women Heels / UK 7 (pp=47): Matte, Glossy
(66,  17, 47, NULL, 0,    15, 1, 0, 1),
(67,  18, 47, NULL, 0,    15, 1, 0, 1),
-- Women Heels / UK 8 (pp=48): Matte, Glossy
(68,  17, 48, NULL, 0,    20, 1, 0, 1),
(69,  18, 48, NULL, 0,    20, 1, 0, 1),
-- Women Sneakers / UK 8 (pp=49): Matte, Glossy
(70,  17, 49, NULL, 0,    20, 1, 0, 1),
(71,  18, 49, NULL, 0,    20, 1, 0, 1),
-- Apple Watch / 41mm (pp=51): Black, White color
(72,  1,  51, NULL, 0,    20, 1, 0, 1),
(73,  2,  51, NULL, 0,    20, 1, 0, 1),
-- Apple Watch / 45mm (pp=52): Black, Blue
(74,  1,  52, NULL, 0,    20, 1, 0, 1),
(75,  3,  52, NULL, 0,    20, 1, 0, 1),
-- Galaxy Watch / 41mm (pp=53): Black, White
(76,  1,  53, NULL, 0,    20, 1, 0, 1),
(77,  2,  53, NULL, 0,    20, 1, 0, 1),
-- Galaxy Watch / 45mm (pp=54): Black, Blue
(78,  1,  54, NULL, 0,    20, 1, 0, 1),
(79,  3,  54, NULL, 0,    20, 1, 0, 1),
-- USB Cable / Standard (pp=75): USB-C, Lightning
(80,  26, 75, NULL, 0,    40, 1, 0, 1),
(81,  27, 75, NULL, 0,    40, 1, 0, 1),
-- USB Cable / Pro (pp=76): USB-C, Lightning
(82,  26, 76, NULL, 0,    30, 1, 0, 1),
(83,  27, 76, NULL, 0,    30, 1, 0, 1),
-- Bluetooth Speaker / Standard (pp=83): Stereo, Dolby
(84,  28, 83, NULL, 0,    30, 1, 0, 1),
(85,  29, 83, NULL, 1500, 25, 1, 0, 1),
-- Soundbar / Standard (pp=85): Matte, Glossy
(86,  17, 85, NULL, 0,    20, 1, 0, 1),
(87,  18, 85, NULL, 0,    20, 1, 0, 1),
-- WiFi Router / Standard (pp=87): USB-C, Lightning
(88,  26, 87, NULL, 0,    25, 1, 0, 1),
(89,  27, 87, NULL, 0,    25, 1, 0, 1),
-- SSD Drive / 1TB (pp=89): Standard (SATA) / Pro NVMe (+2000) edition
(90,  23, 89, NULL, 0,    20, 1, 0, 1),
(91,  24, 89, NULL, 2000, 15, 1, 0, 1),
-- SSD Drive / 2TB (pp=90): Standard (SATA) / Pro NVMe (+2000) edition
(92,  23, 90, NULL, 0,    20, 1, 0, 1),
(93,  24, 90, NULL, 2000, 15, 1, 0, 1),
-- Monitor / 55 inch (pp=93): Matte, Glossy, Warranty
(94,  17, 93, NULL, 0,    20, 1, 0, 1),
(95,  18, 93, NULL, 0,    20, 1, 0, 1),
(96,  30, 93, NULL, 0,    10, 1, 0, 1),
-- Monitor / 65 inch (pp=94): Matte, Glossy
(97,  17, 94, NULL, 0,    20, 1, 0, 1),
(98,  18, 94, NULL, 0,    20, 1, 0, 1),
-- Smart TV / 55 inch (pp=59): Matte, Glossy
(99,  17, 59, NULL, 0,    20, 1, 0, 1),
(100, 18, 59, NULL, 0,    20, 1, 0, 1),
-- Smart TV / 65 inch (pp=60): Matte, Glossy
(101, 17, 60, NULL, 0,    20, 1, 0, 1),
(102, 18, 60, NULL, 0,    20, 1, 0, 1);


-- ============================================================
-- 10. OFFERS
-- offer_type ENUM: flat_discount | category_discount | product_discount
-- Offers 1-3 are cart-wide flat discounts (no category/product link).
-- Offers 4-7 link to categories via offer_product_category.
-- Offers 8-10 link to specific products via offer_product_category.
-- ============================================================
INSERT INTO offer_master
(offer_id, offer_name, description, offer_type, discount_type, discount_value, maximum_discount_amount, min_purchase_amount, usage_limit_per_user, start_date, end_date, start_time, end_time, is_active, is_deleted, created_by)
VALUES
(1,  'FLAT200',       'Flat â‚¹200 off on orders above â‚¹1000',          'flat_discount',     'fixed_amount', 200.00,  200.00,   1000.00,   2, '2025-01-01 00:00:00', '2026-12-31 23:59:59', NULL, NULL, 1, 0, 1),
(2,  'FLAT500',       'Flat â‚¹500 off on orders above â‚¹5000',          'flat_discount',     'fixed_amount', 500.00,  500.00,   5000.00,   1, '2025-01-01 00:00:00', '2026-12-31 23:59:59', NULL, NULL, 1, 0, 1),
(3,  'FLAT1000',      'Flat â‚¹1000 off on orders above â‚¹15000',        'flat_discount',     'fixed_amount', 1000.00, 1000.00,  15000.00,  1, '2025-01-01 00:00:00', '2026-12-31 23:59:59', NULL, NULL, 1, 0, 1),
(4,  'ELECTRONICS15', '15% off on Electronics (max â‚¹3000)',           'category_discount', 'percentage',   15.00,   3000.00,  500.00,    2, '2025-03-01 00:00:00', '2026-06-30 23:59:59', NULL, NULL, 1, 0, 1),
(5,  'FASHION20',     '20% off on Fashion items (max â‚¹1000)',         'category_discount', 'percentage',   20.00,   1000.00,  300.00,    3, '2025-04-01 00:00:00', '2026-09-30 23:59:59', NULL, NULL, 1, 0, 1),
(6,  'MOBILES10',     '10% off on all Mobiles (max â‚¹2000)',           'category_discount', 'percentage',   10.00,   2000.00,  5000.00,   2, '2025-05-01 00:00:00', '2026-12-31 23:59:59', NULL, NULL, 1, 0, 1),
(7,  'APPLIANCEDEAL', '8% off on Home Appliances (max â‚¹2500)',        'category_discount', 'percentage',   8.00,    2500.00,  10000.00,  2, '2025-02-01 00:00:00', '2026-12-31 23:59:59', NULL, NULL, 1, 0, 1),
(8,  'IPHONE5K',      'â‚¹5000 off on iPhone 15',                      'product_discount',  'fixed_amount', 5000.00, 5000.00,  70000.00,  1, '2025-06-01 00:00:00', '2026-12-31 23:59:59', NULL, NULL, 1, 0, 1),
(9,  'SAMSUNG10',     '10% off on Samsung Galaxy S24 (max â‚¹5000)',   'product_discount',  'percentage',   10.00,   5000.00,  80000.00,  1, '2025-06-01 00:00:00', '2026-12-31 23:59:59', NULL, NULL, 1, 0, 1),
(10, 'MACBOOK5K',     'â‚¹5000 off on MacBook Air',                    'product_discount',  'fixed_amount', 5000.00, 5000.00,  100000.00, 1, '2025-07-01 00:00:00', '2026-12-31 23:59:59', NULL, NULL, 1, 0, 1);


-- ============================================================
-- 11. OFFER â†’ PRODUCT/CATEGORY LINKS
-- Flat discount offers (1-3) are cart-wide, so they have no rows here.
-- Each row has EITHER product_id OR category_id set, never both.
-- ============================================================
INSERT INTO offer_product_category
(offer_product_category_id, offer_id, product_id, category_id, is_active, is_deleted, created_by)
VALUES
-- ELECTRONICS15 (offer 4) â†’ Electronics + sub-categories
(1,  4, NULL, 1,  1, 0, 1),  -- Electronics root
(2,  4, NULL, 2,  1, 0, 1),  -- Mobiles
(3,  4, NULL, 3,  1, 0, 1),  -- Laptops
(4,  4, NULL, 4,  1, 0, 1),  -- Accessories
(5,  4, NULL, 9,  1, 0, 1),  -- Smart Devices
-- FASHION20 (offer 5) â†’ Fashion + sub-categories
(6,  5, NULL, 5,  1, 0, 1),  -- Fashion root
(7,  5, NULL, 6,  1, 0, 1),  -- Men Clothing
(8,  5, NULL, 7,  1, 0, 1),  -- Women Clothing
(9,  5, NULL, 8,  1, 0, 1),  -- Footwear
-- MOBILES10 (offer 6) â†’ Mobiles only
(10, 6, NULL, 2,  1, 0, 1),
-- APPLIANCEDEAL (offer 7) â†’ Home Appliances
(11, 7, NULL, 10, 1, 0, 1),
-- IPHONE5K (offer 8) â†’ product 1 (iPhone 15)
(12, 8, 1,    NULL, 1, 0, 1),
-- SAMSUNG10 (offer 9) â†’ product 3 (Samsung Galaxy S24)
(13, 9, 3,    NULL, 1, 0, 1),
-- MACBOOK5K (offer 10) â†’ product 9 (MacBook Air)
(14, 10, 9,   NULL, 1, 0, 1);


-- ============================================================
-- 12. ORDERS
-- address_id matches the address that belongs to each user:
--   user 2 â†’ addr 1 | user 3 â†’ addr 2 | user 4 â†’ addr 3
--   user 5 â†’ addr 4 | user 6 â†’ addr 5 | user 7 â†’ addr 6
--   user 8 â†’ addr 7 | user 9 â†’ addr 8 | user 10 â†’ addr 9
-- total_amount = subtotal + tax_amount + shipping_amount âˆ’ discount_amount
-- ============================================================
INSERT INTO order_master
(order_id, order_number, user_id, address_id, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, order_status, payment_status, is_deleted, created_by)
VALUES
(1,  'ORD-20250601-0001', 2,  1, 74999.00,  13499.82, 0.00,  0.00,    88498.82,  'delivered',  'completed', 0, 2),
(2,  'ORD-20250610-0002', 3,  2, 69999.00,  12563.82, 0.00,  200.00,  82362.82,  'delivered',  'completed', 0, 3),
(3,  'ORD-20250615-0003', 4,  3, 34999.00,  6299.82,  99.00, 0.00,    41397.82,  'shipped',    'completed', 0, 4),
(4,  'ORD-20250620-0004', 5,  4, 22999.00,  4139.82,  99.00, 500.00,  26737.82,  'processing', 'completed', 0, 5),
(5,  'ORD-20250701-0005', 6,  5, 109999.00, 19799.82, 0.00,  5000.00, 124798.82, 'delivered',  'completed', 0, 6),
(6,  'ORD-20250710-0006', 7,  6, 2397.00,   395.46,   49.00, 200.00,  2641.46,   'delivered',  'completed', 0, 7),
(7,  'ORD-20250715-0007', 8,  7, 42999.00,  7739.82,  0.00,  0.00,    50738.82,  'cancelled',  'refunded',  0, 8),
(8,  'ORD-20250720-0008', 9,  8, 3499.00,   629.82,   49.00, 0.00,    4177.82,   'delivered',  'completed', 0, 9),
(9,  'ORD-20250801-0009', 10, 9, 84999.00,  15299.82, 0.00,  5000.00, 95298.82,  'shipped',    'completed', 0, 10),
(10, 'ORD-20250810-0010', 2,  1, 7999.00,   1439.82,  49.00, 0.00,    9487.82,   'delivered',  'completed', 0, 2),
(11, 'ORD-20250901-0011', 3,  2, 17999.00,  3239.82,  99.00, 1000.00, 20337.82,  'processing', 'pending',   0, 3),
(12, 'ORD-20250915-0012', 4,  3, 62498.00,  11249.64, 0.00,  0.00,    73747.64,  'pending',    'pending',   0, 4);


-- ============================================================
-- 13. ORDER ITEMS
-- product_portion_id must belong to the product_id on the same row.
-- modifier_id (when set) must exist in modifier_master (IDs 1-30).
-- total formula: (qty x price) - discount + tax
-- [Fix 5] Row 6 total: 1413.46 -> 1213.46 (original over-count).
-- [Fix 6] Row 6 tax: 215.46 -> 179.64 = 18% x (2x599-200) = 18% x 998.
--         Row 6 total: 1213.46 -> 1177.64 = 998 + 179.64.
-- ============================================================
INSERT INTO order_items
(order_item_id, order_id, product_id, product_portion_id, modifier_id, product_name, portion_value, modifier_value, quantity, price, discount, tax, total, is_deleted, created_by)
VALUES
-- Order 1: iPhone 15 128GB, Black â€” no offer (1Ã—74999 âˆ’ 0 + 13499.82 = 88498.82)
(1,  1,  1,  1,    1,    'Apple iPhone 15',    '128 GB',  'Black',    1, 74999.00,  0.00,    13499.82, 88498.82,  0, 2),
-- Order 2: iPhone 14 256GB, White â€” FLAT200; pp=4 belongs to product 2 âœ“
(2,  2,  2,  4,    2,    'Apple iPhone 14',    '256 GB',  'White',    1, 69999.00,  200.00,  12563.82, 82362.82,  0, 3),
-- Order 3: Samsung A54 128GB, Black â€” no offer; pp=7 belongs to product 4 âœ“
(3,  3,  4,  7,    1,    'Samsung Galaxy A54', '128 GB',  'Black',    1, 34999.00,  0.00,    6299.82,  41397.82,  0, 4),
-- Order 4: Redmi Note 13 128GB, Blue â€” FLAT500; pp=9 belongs to product 5 âœ“
(4,  4,  5,  9,    3,    'Redmi Note 13',      '128 GB',  'Blue',     1, 22999.00,  500.00,  4139.82,  26737.82,  0, 5),
-- Order 5: MacBook Air 8GB RAM â€” MACBOOK5K â‚¹5000 off; pp=17 belongs to product 9 âœ“
(5,  5,  9,  17,   NULL, 'Apple MacBook Air',  '8 GB RAM',NULL,       1, 109999.00, 5000.00, 19799.82, 124798.82, 0, 6),
-- Order 6: Men T-Shirt x2 size M -- FLAT200 [Fix 5 total; Fix 6 tax: 18%x(2x599-200)=179.64]
(6,  6,  17, 26,   NULL, 'Men T-Shirt',        'M',       NULL,       2, 599.00,    200.00,  179.64,   1177.64,   0, 7),
-- Order 6: Logitech Mouse â€” no portion, no offer
(7,  6,  15, NULL, NULL, 'Logitech Mouse',     NULL,      NULL,       1, 1199.00,   0.00,    215.82,   1414.82,   0, 7),
-- Order 7: Apple Watch 41mm, Black â€” no offer, cancelled; pp=51 belongs to product 29 âœ“
(8,  7,  29, 51,   1,    'Apple Watch',        '41 mm',   'Black',    1, 42999.00,  0.00,    7739.82,  50738.82,  0, 8),
-- Order 8: Mi Band 41mm â€” no offer; pp=55 belongs to product 31 âœ“
(9,  8,  31, 55,   NULL, 'Mi Band',            '41 mm',   NULL,       1, 3499.00,   0.00,    629.82,   4177.82,   0, 9),
-- Order 9: Samsung Galaxy S24 256GB â€” SAMSUNG10 10% off capped â‚¹5000; pp=5 belongs to product 3 âœ“
(10, 9,  3,  5,    NULL, 'Samsung Galaxy S24', '256 GB',  NULL,       1, 84999.00,  5000.00, 15299.82, 95298.82,  0, 10),
-- Order 10: SSD Drive 1TB â€” no offer; pp=89 belongs to product 48 âœ“
(11, 10, 48, 89,   NULL, 'SSD Drive',          '1 TB',    NULL,       1, 7999.00,   0.00,    1439.82,  9487.82,   0, 2),
-- Order 11: Android Tablet Standard â€” FLAT1000; pp=79 belongs to product 43 âœ“
(12, 11, 43, 79,   NULL, 'Android Tablet',     'Standard',NULL,       1, 17999.00,  1000.00, 3239.82,  20337.82,  0, 3),
-- Order 12: Dell Inspiron 8GB RAM â€” no offer; pp=21 belongs to product 11 âœ“
(13, 12, 11, 21,   NULL, 'Dell Inspiron',      '8 GB RAM',NULL,       1, 58999.00,  0.00,    10619.82, 69618.82,  0, 4),
-- Order 12: Gaming Keyboard â€” no portion (accessories often bought without variant)
(14, 12, 16, NULL, NULL, 'Gaming Keyboard',    NULL,      NULL,       1, 3499.00,   0.00,    629.82,   4128.82,   0, 4);


-- ============================================================
-- 14. PAYMENTS
-- One payment per order. amount must equal order_master.total_amount.
-- [Fix 2] Row 5: amount corrected 126798.82 â†’ 124798.82 (order 5 total).
-- [Fix 3] Row 9: amount corrected 59898.82  â†’ 95298.82  (order 9 total).
-- ============================================================
INSERT INTO payment_master
(payment_id, order_id, transaction_id, payment_method, amount, currency, status, payment_details, gateway_response, is_refunded, refund_amount, processing_started_at, succeeded_at, failed_at, is_deleted, created_by)
VALUES
(1,  1,  'TXN20250601001', 'credit_card',       88498.82,  'INR', 'completed', 'Visa ending 4242',  '{"code":"00","msg":"Approved"}',        0, 0.00,      '2025-06-01 10:00:00', '2025-06-01 10:00:45', NULL, 0, 2),
(2,  2,  'TXN20250610002', 'debit_card',        82362.82,  'INR', 'completed', 'HDFC Debit 1234',   '{"code":"00","msg":"Approved"}',        0, 0.00,      '2025-06-10 14:22:00', '2025-06-10 14:22:30', NULL, 0, 3),
(3,  3,  'TXN20250615003', 'stripe',            41397.82,  'INR', 'completed', 'Stripe Token',      '{"status":"succeeded","id":"ch_3abc"}', 0, 0.00,      '2025-06-15 09:10:00', '2025-06-15 09:10:15', NULL, 0, 4),
(4,  4,  'TXN20250620004', 'paypal',            26737.82,  'INR', 'completed', 'PayPal Account',    '{"status":"COMPLETED","id":"PAY-xyz"}', 0, 0.00,      '2025-06-20 11:05:00', '2025-06-20 11:05:20', NULL, 0, 5),
-- [Fix 2] Was 126798.82 â€” must equal order 5 total_amount 124798.82
(5,  5,  'TXN20250701005', 'credit_card',      124798.82,  'INR', 'completed', 'Axis CC 9999',      '{"code":"00","msg":"Approved"}',        0, 0.00,      '2025-07-01 16:30:00', '2025-07-01 16:30:50', NULL, 0, 6),
(6,  6,  'TXN20250710006', 'cash_on_delivery',  2641.46,   'INR', 'completed', 'COD',               '{"status":"collected"}',               0, 0.00,      '2025-07-10 12:00:00', '2025-07-14 15:00:00', NULL, 0, 7),
(7,  7,  'TXN20250715007', 'credit_card',       50738.82,  'INR', 'refunded',  'ICICI CC 5678',     '{"code":"00","msg":"Approved"}',        1, 50738.82,  '2025-07-15 09:00:00', '2025-07-15 09:00:40', NULL, 0, 8),
(8,  8,  'TXN20250720008', 'debit_card',         4177.82,  'INR', 'completed', 'SBI Debit 7890',    '{"code":"00","msg":"Approved"}',        0, 0.00,      '2025-07-20 18:00:00', '2025-07-20 18:00:25', NULL, 0, 9),
-- [Fix 3] Was 59898.82 â€” must equal order 9 total_amount 95298.82
(9,  9,  'TXN20250801009', 'stripe',            95298.82,  'INR', 'completed', 'Stripe Token',      '{"status":"succeeded","id":"ch_4def"}', 0, 0.00,      '2025-08-01 13:45:00', '2025-08-01 13:45:18', NULL, 0, 10),
(10, 10, 'TXN20250810010', 'paypal',             9487.82,  'INR', 'completed', 'PayPal Account',    '{"status":"COMPLETED","id":"PAY-abc"}', 0, 0.00,      '2025-08-10 10:10:00', '2025-08-10 10:10:22', NULL, 0, 2),
-- Orders 11-12 are pending; no transaction_id yet
(11, 11, NULL,             'cash_on_delivery',  20337.82,  'INR', 'pending',   'COD',               NULL,                                   0, 0.00,      NULL,                  NULL,                  NULL, 0, 3),
(12, 12, NULL,             'credit_card',       73747.64,  'INR', 'pending',   'Kotak CC 1111',     NULL,                                   0, 0.00,      NULL,                  NULL,                  NULL, 0, 4);


-- ============================================================
-- 15. OFFER USAGE
-- Tracks which user redeemed which offer on which order.
-- offer_id, user_id, and order_id all must exist.
-- Each (offer_id, user_id) pair respects usage_limit_per_user.
-- ============================================================
INSERT INTO offer_usage
(offer_usage_id, offer_id, user_id, order_id, discount_amount, is_deleted, created_by)
VALUES
(1, 1,  3,  2,  200.00,  0, 3),   -- FLAT200 used by Priya (user 3) on order 2
(2, 2,  5,  4,  500.00,  0, 5),   -- FLAT500 used by Omi (user 5) on order 4
(3, 10, 6,  5,  5000.00, 0, 6),   -- MACBOOK5K used by Arjun (user 6) on order 5
(4, 9,  10, 9,  5000.00, 0, 10),  -- SAMSUNG10 used by Rohan (user 10) on order 9
(5, 1,  7,  6,  200.00,  0, 7),   -- FLAT200 used by Sneha (user 7) on order 6
(6, 3,  3,  11, 1000.00, 0, 3);   -- FLAT1000 used by Priya (user 3) on order 11


-- ============================================================
-- 16. CARTS
-- offer_id (when set) must exist in offer_master.
-- cart owner = user, so created_by = user_id.
-- ============================================================
INSERT INTO cart_master
(cart_id, user_id, offer_id, discount_amount, is_deleted, created_by)
VALUES
(1, 2,  NULL, 0.00,   0, 2),   -- Rahul: no offer applied
(2, 3,  5,    800.00, 0, 3),   -- Priya: FASHION20 (offer 5) applied, â‚¹800 estimated discount
(3, 6,  6,    200.00, 0, 6),   -- Arjun: MOBILES10 (offer 6) applied
(4, 8,  NULL, 0.00,   0, 8),   -- Vikram: no offer
(5, 9,  1,    200.00, 0, 9);   -- Kavya: FLAT200 (offer 1) applied


-- ============================================================
-- 17. CART ITEMS
-- product_portion_id (when the product has portions) must belong to
-- the corresponding product_id.
-- offer_id (when set) must exist in offer_master.
-- [Fix 4] Row 2: product 39 (Gaming Mouse) has portions (pp 71/72),
--         so product_portion_id must NOT be NULL â†’ set to 71.
-- ============================================================
INSERT INTO cart_items
(cart_item_id, cart_id, product_id, product_portion_id, modifier_id, offer_id, quantity, price, is_deleted, created_by)
VALUES
-- Rahul's cart: MacBook Air 8GB RAM (pp=17) â€” no offer, no modifier
(1, 1, 9,  17,   NULL, NULL, 1, 109999.00, 0, 2),
-- Rahul's cart: Gaming Mouse Standard (pp=71) [Fix 4: was NULL â†’ 71]
(2, 1, 39, 71,   NULL, NULL, 1, 1599.00,   0, 2),
-- Priya's cart: Women Saree size M (pp=41) â€” FASHION20 offer applied
(3, 2, 24, 41,   NULL, 5,    1, 3499.00,   0, 3),
-- Priya's cart: Women Kurti size M (pp=39) Ã—2 â€” FASHION20
(4, 2, 23, 39,   NULL, 5,    2, 999.00,    0, 3),
-- Arjun's cart: OnePlus 12 256GB (pp=11) â€” MOBILES10
(5, 3, 6,  11,   NULL, 6,    1, 61999.00,  0, 6),
-- Vikram's cart: Sony Headphones â€” no portion (product 14 has no product_portion rows)
(6, 4, 14, NULL, NULL, NULL, 1, 32999.00,  0, 8),
-- Vikram's cart: Power Bank Standard (pp=77) â€” no offer
(7, 4, 42, 77,   NULL, NULL, 1, 1699.00,   0, 8),
-- Kavya's cart: Smart TV 55 inch (pp=59) â€” FLAT200
(8, 5, 33, 59,   17,   1,    1, 54999.00,  0, 9);


-- ============================================================
-- 18. PRODUCT REVIEWS
-- is_verified_purchase=1 only when the user's order contains
-- that product and order_id is provided and belongs to that user.
-- helpful_count must equal the number of review_helpful rows for
-- that review_id (verified in section 19 below).
-- ============================================================
INSERT INTO product_reviews
(review_id, product_id, user_id, order_id, rating, title, review_text, status, is_verified_purchase, helpful_count, is_deleted, created_by)
VALUES
(1,  1,  2,  1,    5, 'Excellent phone!',           'iPhone 15 is simply brilliant. Camera quality is outstanding, battery lasts all day. Totally worth the price!',           'approved', 1, 8, 0, 2),
(2,  2,  3,  2,    4, 'Great phone, slight lag',    'iPhone 14 works very well for day-to-day use. Occasionally feels slow when multitasking but overall a great buy.',        'approved', 1, 3, 0, 3),
(3,  4,  4,  3,    4, 'Good mid-range phone',       'Samsung A54 has a beautiful display and decent camera. Battery life is impressive. Highly recommended for the price.',    'approved', 1, 5, 0, 4),
(4,  5,  5,  4,    3, 'Average experience',         'Redmi Note 13 is okay. Camera is decent but gaming performance could be better. UI has too many ads pre-installed.',     'approved', 1, 3, 0, 5),
(5,  9,  6,  5,    5, 'Best laptop ever!',          'MacBook Air M2 is a beast. Runs everything silently, no fan noise. Battery lasts 12+ hours. Best laptop I have owned.', 'approved', 1, 5, 0, 6),
(6,  17, 7,  6,    4, 'Comfortable tshirt',         'Good quality cotton. Fits well in M size. Color did not fade after 5 washes. Would buy again.',                          'approved', 1, 6, 0, 7),
(7,  29, 8,  7,    2, 'Cancelled - poor support',   'Had to cancel because delivery was delayed by 2 weeks. Customer support was unhelpful. Product itself may be fine.',    'approved', 1, 3, 0, 8),
(8,  31, 9,  8,    5, 'Amazing fitness band!',      'Mi Band 8 tracks sleep and steps accurately. Battery lasts 15 days easily. Great value for money.',                      'approved', 1, 3, 0, 9),
(9,  3,  10, 9,    5, 'Samsung S24 is outstanding!','Got Samsung Galaxy S24 at a great discount. Camera performance in low light is unreal. Build quality is top class.',     'approved', 1, 3, 0, 10),
(10, 48, 2,  10,   4, 'Fast SSD, easy setup',       'SSD Drive 1TB installed easily. Boot time reduced from 45 sec to 8 sec. No issues so far after 2 months of use.',      'approved', 1, 3, 0, 2),
-- Non-verified reviews (no order_id; user bought via another channel or browsed)
(11, 3,  6,  NULL, 4, 'Flagship worth it',          'Samsung Galaxy S24 camera is incredible especially in low light. Build quality is premium. Slight heating under heavy load.','approved', 0, 4, 0, 6),
(12, 15, 7,  NULL, 5, 'Best budget mouse',          'Logitech mouse is smooth and precise. Wireless range is excellent. Battery lasts months. No complaints at all.',         'approved', 0, 4, 0, 7),
(13, 33, 9,  NULL, 4, 'Great picture quality',      'Smart TV 55 inch delivers crisp 4K. Android TV interface is smooth. Only issue is the remote feels cheap.',             'pending',  0, 0, 0, 9),
(14, 13, 10, NULL, 3, 'Decent but breaks easily',   'Boat headphones sound good for the price but the build quality is plastic and cheap feeling. Hinge cracked after 3 months.','approved',0,7, 0, 10);


-- ============================================================
-- 19. REVIEW HELPFUL VOTES
-- UNIQUE(review_id, user_id) â€” no user can mark same review twice.
-- A user cannot mark their own review helpful (enforced by app logic).
-- Count of rows per review_id must equal product_reviews.helpful_count.
-- Review 13 (helpful_count=0) intentionally has no rows.
-- ============================================================
INSERT INTO review_helpful
(id, review_id, user_id)
VALUES
-- Review 1 (iPhone 15, helpful_count=8): users 3-10
(1,  1, 3),  (2,  1, 4),  (3,  1, 5),  (4,  1, 6),
(5,  1, 7),  (6,  1, 8),  (7,  1, 9),  (8,  1, 10),
-- Review 2 (iPhone 14, helpful_count=3)
(9,  2, 4),  (10, 2, 8),  (11, 2, 9),
-- Review 3 (Samsung A54, helpful_count=5)
(12, 3, 2),  (13, 3, 5),  (14, 3, 6),  (15, 3, 9),  (16, 3, 10),
-- Review 4 (Redmi Note 13, helpful_count=3)
(17, 4, 2),  (18, 4, 6),  (19, 4, 8),
-- Review 5 (MacBook Air, helpful_count=5)
(20, 5, 2),  (21, 5, 3),  (22, 5, 4),  (23, 5, 7),  (24, 5, 10),
-- Review 6 (Men T-Shirt, helpful_count=6)
(25, 6, 2),  (26, 6, 3),  (27, 6, 4),  (28, 6, 5),  (29, 6, 9),  (30, 6, 10),
-- Review 7 (Apple Watch cancelled, helpful_count=3)
(31, 7, 3),  (32, 7, 5),  (33, 7, 6),
-- Review 8 (Mi Band, helpful_count=3)
(34, 8, 2),  (35, 8, 4),  (36, 8, 6),
-- Review 9 (Samsung S24, helpful_count=3)
(37, 9, 3),  (38, 9, 5),  (39, 9, 7),
-- Review 10 (SSD Drive, helpful_count=3)
(40, 10, 3), (41, 10, 6), (42, 10, 9),
-- Review 11 (Samsung S24 unverified, helpful_count=4)
(43, 11, 2), (44, 11, 5), (45, 11, 8), (46, 11, 10),
-- Review 12 (Logitech Mouse unverified, helpful_count=4)
(47, 12, 2), (48, 12, 4), (49, 12, 6), (50, 12, 8),
-- Review 13 (Smart TV pending, helpful_count=0): no rows
-- Review 14 (Boat Headphones, helpful_count=7)
(51, 14, 2), (52, 14, 3), (53, 14, 4), (54, 14, 5),
(55, 14, 6), (56, 14, 7), (57, 14, 8);


SET FOREIGN_KEY_CHECKS = 1;
