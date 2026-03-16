-- Migration: Add support for multiple modifiers per cart item
-- Run this SQL to add the cart_item_modifiers table

-- Create junction table for multiple modifiers per cart item
CREATE TABLE IF NOT EXISTS `cart_item_modifiers` (
  `cart_item_modifier_id` int NOT NULL AUTO_INCREMENT,
  `cart_item_id` int NOT NULL,
  `modifier_portion_id` int NOT NULL,
  `modifier_id` int NOT NULL,
  `additional_price` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_modifier_id`),
  UNIQUE KEY `unique_cart_item_modifier` (`cart_item_id`, `modifier_portion_id`),
  KEY `fk_cart_item_modifiers_cart_item` (`cart_item_id`),
  KEY `fk_cart_item_modifiers_modifier_portion` (`modifier_portion_id`),
  KEY `fk_cart_item_modifiers_modifier` (`modifier_id`),
  CONSTRAINT `fk_cart_item_modifiers_cart_item` FOREIGN KEY (`cart_item_id`) REFERENCES `cart_items` (`cart_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_item_modifiers_modifier_portion` FOREIGN KEY (`modifier_portion_id`) REFERENCES `modifier_portion` (`modifier_portion_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_item_modifiers_modifier` FOREIGN KEY (`modifier_id`) REFERENCES `modifier_master` (`modifier_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- The existing modifier_id column in cart_items will be deprecated
-- New items should use cart_item_modifiers table for all modifiers
