-- Proper Modifier-Portion Mapping for Phones Only
-- Links Color (modifier_id 1-8, 15-17) and RAM (modifier_id 9-10) to phone product portions only

-- First, let's identify phone products and their portions
-- Phones: product_id 1,2 (iPhone), 3,4 (Samsung), 5 (Redmi), 6 (POCO), 7 (OnePlus), 8 (OnePlus Nord)
-- Their portions: 1-17 (see product_portion table)

-- Clear existing modifier_portion data first
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM modifier_portion;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Color and RAM modifiers for phone product portions only
-- iPhone 15 Pro Max (product_id=1) - portions 1,2,3 (256GB, 512GB, 1TB)
INSERT INTO modifier_portion (modifier_id, product_portion_id, additional_price, stock, is_active, is_deleted, created_by, updated_by) VALUES
-- Colors for iPhone 15 Pro Max
(1, 1, 0.00, 10, 1, 0, 1, 1),  -- Black - 256GB
(2, 1, 0.00, 10, 1, 0, 1, 1),  -- Blue - 256GB
(3, 1, 0.00, 10, 1, 0, 1, 1),  -- Natural Titanium - 256GB
(1, 2, 0.00, 8, 1, 0, 1, 1),   -- Black - 512GB
(2, 2, 0.00, 8, 1, 0, 1, 1),   -- Blue - 512GB
(3, 2, 0.00, 8, 1, 0, 1, 1),   -- Natural Titanium - 512GB
(1, 3, 0.00, 5, 1, 0, 1, 1),   -- Black - 1TB
(2, 3, 0.00, 5, 1, 0, 1, 1),   -- Blue - 1TB
(3, 3, 0.00, 5, 1, 0, 1, 1);   -- Natural Titanium - 1TB

-- iPhone 14 (product_id=2) - portions 4,5 (128GB, 256GB)
INSERT INTO modifier_portion (modifier_id, product_portion_id, additional_price, stock, is_active, is_deleted, created_by, updated_by) VALUES
(1, 4, 0.00, 15, 1, 0, 1, 1),  -- Black - 128GB
(2, 4, 0.00, 15, 1, 0, 1, 1),  -- Blue - 128GB
(8, 4, 0.00, 15, 1, 0, 1, 1),  -- White - 128GB
(1, 5, 0.00, 12, 1, 0, 1, 1),  -- Black - 256GB
(2, 5, 0.00, 12, 1, 0, 1, 1),  -- Blue - 256GB
(8, 5, 0.00, 12, 1, 0, 1, 1);  -- White - 256GB

-- Samsung Galaxy S24 Ultra (product_id=3) - portions 6,7 (256GB, 512GB)
INSERT INTO modifier_portion (modifier_id, product_portion_id, additional_price, stock, is_active, is_deleted, created_by, updated_by) VALUES
(4, 6, 0.00, 12, 1, 0, 1, 1),  -- Titanium Gray - 256GB
(5, 6, 0.00, 12, 1, 0, 1, 1),  -- Titanium Black - 256GB
(9, 6, 0.00, 12, 1, 0, 1, 1),  -- 8GB RAM - 256GB
(10, 6, 2000.00, 10, 1, 0, 1, 1), -- 12GB RAM - 256GB
(4, 7, 0.00, 8, 1, 0, 1, 1),   -- Titanium Gray - 512GB
(5, 7, 0.00, 8, 1, 0, 1, 1),   -- Titanium Black - 512GB
(9, 7, 0.00, 8, 1, 0, 1, 1),   -- 8GB RAM - 512GB
(10, 7, 2000.00, 6, 1, 0, 1, 1); -- 12GB RAM - 512GB

-- Samsung Galaxy A55 (product_id=4) - portions 8,9 (128GB, 256GB)
INSERT INTO modifier_portion (modifier_id, product_portion_id, additional_price, stock, is_active, is_deleted, created_by, updated_by) VALUES
(1, 8, 0.00, 20, 1, 0, 1, 1),  -- Black - 128GB
(2, 8, 0.00, 20, 1, 0, 1, 1),  -- Blue - 128GB
(15, 8, 0.00, 20, 1, 0, 1, 1), -- Navy Blue - 128GB
(16, 8, 0.00, 20, 1, 0, 1, 1), -- Red - 128GB
(1, 9, 0.00, 15, 1, 0, 1, 1),  -- Black - 256GB
(2, 9, 0.00, 15, 1, 0, 1, 1),  -- Blue - 256GB
(15, 9, 0.00, 15, 1, 0, 1, 1), -- Navy Blue - 256GB
(16, 9, 0.00, 15, 1, 0, 1, 1); -- Red - 256GB

-- Redmi Note 13 Pro (product_id=5) - portions 10,11 (128GB, 256GB)
INSERT INTO modifier_portion (modifier_id, product_portion_id, additional_price, stock, is_active, is_deleted, created_by, updated_by) VALUES
(6, 10, 0.00, 25, 1, 0, 1, 1), -- Flowy Emerald - 128GB
(7, 10, 0.00, 25, 1, 0, 1, 1), -- Silky Black - 128GB
(9, 10, 0.00, 25, 1, 0, 1, 1), -- 8GB RAM - 128GB
(10, 10, 2000.00, 20, 1, 0, 1, 1), -- 12GB RAM - 128GB
(6, 11, 0.00, 20, 1, 0, 1, 1), -- Flowy Emerald - 256GB
(7, 11, 0.00, 20, 1, 0, 1, 1), -- Silky Black - 256GB
(9, 11, 0.00, 20, 1, 0, 1, 1), -- 8GB RAM - 256GB
(10, 11, 2000.00, 15, 1, 0, 1, 1); -- 12GB RAM - 256GB

-- POCO X6 (product_id=6) - portions 12,13 (128GB, 256GB)
INSERT INTO modifier_portion (modifier_id, product_portion_id, additional_price, stock, is_active, is_deleted, created_by, updated_by) VALUES
(1, 12, 0.00, 22, 1, 0, 1, 1), -- Black - 128GB
(2, 12, 0.00, 22, 1, 0, 1, 1), -- Blue - 128GB
(9, 12, 0.00, 22, 1, 0, 1, 1), -- 8GB RAM - 128GB
(10, 12, 2000.00, 18, 1, 0, 1, 1), -- 12GB RAM - 128GB
(1, 13, 0.00, 18, 1, 0, 1, 1), -- Black - 256GB
(2, 13, 0.00, 18, 1, 0, 1, 1), -- Blue - 256GB
(9, 13, 0.00, 18, 1, 0, 1, 1), -- 8GB RAM - 256GB
(10, 13, 2000.00, 15, 1, 0, 1, 1); -- 12GB RAM - 256GB

-- OnePlus 12 (product_id=7) - portions 14,15 (256GB, 512GB)
INSERT INTO modifier_portion (modifier_id, product_portion_id, additional_price, stock, is_active, is_deleted, created_by, updated_by) VALUES
(1, 14, 0.00, 15, 1, 0, 1, 1), -- Black - 256GB
(2, 14, 0.00, 15, 1, 0, 1, 1), -- Blue - 256GB
(9, 14, 0.00, 15, 1, 0, 1, 1), -- 8GB RAM - 256GB
(10, 14, 2000.00, 12, 1, 0, 1, 1), -- 12GB RAM - 256GB
(1, 15, 0.00, 10, 1, 0, 1, 1), -- Black - 512GB
(2, 15, 0.00, 10, 1, 0, 1, 1), -- Blue - 512GB
(9, 15, 0.00, 10, 1, 0, 1, 1), -- 8GB RAM - 512GB
(10, 15, 2000.00, 8, 1, 0, 1, 1); -- 12GB RAM - 512GB

-- OnePlus Nord 3 (product_id=8) - portions 16,17 (128GB, 256GB)
INSERT INTO modifier_portion (modifier_id, product_portion_id, additional_price, stock, is_active, is_deleted, created_by, updated_by) VALUES
(1, 16, 0.00, 25, 1, 0, 1, 1), -- Black - 128GB
(2, 16, 0.00, 25, 1, 0, 1, 1), -- Blue - 128GB
(9, 16, 0.00, 25, 1, 0, 1, 1), -- 8GB RAM - 128GB
(1, 17, 0.00, 20, 1, 0, 1, 1), -- Black - 256GB
(2, 17, 0.00, 20, 1, 0, 1, 1), -- Blue - 256GB
(9, 17, 0.00, 20, 1, 0, 1, 1), -- 8GB RAM - 256GB
(10, 17, 2000.00, 15, 1, 0, 1, 1); -- 12GB RAM - 256GB

-- Verify the insertions
SELECT p.display_name, pm.portion_value, mm.modifier_name, mm.modifier_value, mp.additional_price, mp.stock
FROM modifier_portion mp
JOIN modifier_master mm ON mm.modifier_id = mp.modifier_id
JOIN product_portion pp ON pp.product_portion_id = mp.product_portion_id
JOIN portion_master pm ON pm.portion_id = pp.portion_id
JOIN product_master p ON p.product_id = pp.product_id
WHERE mp.is_deleted = 0
ORDER BY p.display_name, pm.portion_value, mm.modifier_name;
