-- Add tax_percent column to category_master for database-driven tax rates.
-- Default 0 means "inherit from parent / no tax".
-- Only root categories typically need a value set.

ALTER TABLE `category_master`
  ADD COLUMN `tax_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00
  AFTER `parent_id`;

-- Seed existing root categories with the old hardcoded values.
-- Adjust these IDs / rates to match your actual data.
UPDATE `category_master` SET `tax_percent` = 18.00 WHERE `category_id` = 1;
UPDATE `category_master` SET `tax_percent` = 5.00  WHERE `category_id` = 27;
