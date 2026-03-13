-- Migration: Add missing columns to product_images table
-- Run this BEFORE the seeder

-- Check if columns exist first, if error occurs, column already exists (ignore)
ALTER TABLE `product_images` ADD COLUMN `alt_text` varchar(255) DEFAULT NULL AFTER `public_id`;
ALTER TABLE `product_images` ADD COLUMN `sort_order` int DEFAULT 0 AFTER `is_primary`;
ALTER TABLE `product_images` ADD COLUMN `is_active` tinyint(1) DEFAULT 1 AFTER `is_deleted`;

-- sort_order was missing, add it now
ALTER TABLE `product_images` ADD COLUMN `sort_order` int DEFAULT 0 AFTER `is_primary`;

-- Verify columns were added
DESCRIBE `product_images`;
