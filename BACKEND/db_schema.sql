-- MySQL dump - Merged Schema
-- Database: ecommerce_accrete
-- Merged from: ommm.sql, ecommerce-accrete.sql, offer_updated_schema.txt, db_schema_user.sql
-- Generated: 2026-02-19
--
-- Changes merged:
--   [ommm.sql]              Added product_images table
--   [ommm.sql]              Added review_helpful table
--   [ommm.sql]              offer_master: added category_id, product_id columns + FKs
--   [ommm.sql]              offer_usage: added usage_count column
--   [ecommerce-accrete.sql] Added offer_product_category table
--   [ecommerce-accrete.sql] cart_items: added offer_id column
--   [ecommerce-accrete.sql] cart_master: added offer_id, discount_amount columns
--   [db_schema_user.sql]    user_master: added is_blocked, refresh_token columns
-- ------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ============================================================
-- Table: user_master
-- Changes: Added is_blocked (db_schema_user.sql) and refresh_token (db_schema_user.sql)
-- ============================================================

DROP TABLE IF EXISTS `user_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_master` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','admin') NOT NULL DEFAULT 'customer',
  `is_deleted` tinyint(1) DEFAULT '0',
  `is_blocked` tinyint(1) DEFAULT '0',
  `refresh_token` text DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `user_master` WRITE;
/*!40000 ALTER TABLE `user_master` DISABLE KEYS */;
INSERT INTO `user_master` VALUES
(1,'Admin User','admin@example.com','admin123','admin',0,0,NULL,NULL,NULL,NULL,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(2,'Rahul Sharma','rahul@example.com','password123','customer',0,0,NULL,NULL,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(3,'Priya Singh','priya@example.com','password123','customer',0,0,NULL,NULL,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(4,'om','om@gmail.com','$2b$10$d4IVAEVTp3tDa8vTZW2zZ.KVTToxTvcPV8dBA1hBuo1YojevV5SUu','customer',0,0,NULL,NULL,1,NULL,'2026-02-17 10:53:02','2026-02-17 10:53:02'),
(5,'omi','omi@gmail.com','$2b$10$XmqPYzOtmfEORvztqTb3rOX9LCh7QH8G5/MgZR4/K5ejzSoxyGJta','customer',0,0,NULL,NULL,1,NULL,'2026-02-17 12:08:02','2026-02-17 12:08:02');
/*!40000 ALTER TABLE `user_master` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: category_master
-- ============================================================

DROP TABLE IF EXISTS `category_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_master` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  KEY `idx_categories_parent` (`parent_id`),
  KEY `fk_categories_created_by` (`created_by`),
  KEY `fk_categories_updated_by` (`updated_by`),
  CONSTRAINT `fk_categories_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `category_master` (`category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_categories_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `category_master` WRITE;
/*!40000 ALTER TABLE `category_master` DISABLE KEYS */;
INSERT INTO `category_master` VALUES
(1,'Electronics',NULL,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(2,'Phones',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(3,'Android Phones',2,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(4,'iPhones',2,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(5,'Samsung Phones',3,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(6,'Xiaomi Phones',3,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(7,'OnePlus Phones',3,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(8,'Samsung Galaxy S Series',5,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(9,'Samsung Galaxy A Series',5,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(10,'Redmi Note Series',6,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(11,'Poco Series',6,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(12,'OnePlus Number Series',7,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(13,'OnePlus Nord Series',7,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(14,'iPhone 13 Series',4,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(15,'iPhone 14 Series',4,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(16,'iPhone 15 Series',4,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(17,'Televisions',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(18,'Smart TVs',17,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(19,'LED TVs',17,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(20,'Wearables',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(21,'Smartwatches',20,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(22,'Fitness Bands',20,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(23,'Accessories',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(24,'Phone Cases',23,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(25,'Chargers & Cables',23,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(26,'Headphones & Earbuds',23,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(27,'Fashion',NULL,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(28,'Men Fashion',27,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(29,'Women Fashion',27,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(30,'Kids Fashion',27,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(31,'Men Clothing',28,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(32,'Men Shoes',28,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(33,'Women Clothing',29,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(34,'Women Shoes',29,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(35,'Men T-Shirts',31,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(36,'Men Jeans',31,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(37,'Women Dresses',33,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(38,'Women Tops & Tees',33,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(39,'Men Sports Shoes',32,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(40,'Men Casual Shoes',32,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(41,'Women Heels',34,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(42,'Women Sneakers',34,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05');
/*!40000 ALTER TABLE `category_master` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: portion_master
-- ============================================================

DROP TABLE IF EXISTS `portion_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `portion_master` (
  `portion_id` int NOT NULL AUTO_INCREMENT,
  `portion_value` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`portion_id`),
  KEY `fk_portions_created_by` (`created_by`),
  KEY `fk_portions_updated_by` (`updated_by`),
  CONSTRAINT `fk_portions_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_portions_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `portion_master` WRITE;
/*!40000 ALTER TABLE `portion_master` DISABLE KEYS */;
INSERT INTO `portion_master` VALUES
(1,'128 GB','Storage: 128 GB',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(2,'256 GB','Storage: 256 GB',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(3,'512 GB','Storage: 512 GB',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(4,'1 TB','Storage: 1 TB',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(5,'41 mm','Watch case: 41 mm',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(6,'45 mm','Watch case: 45 mm',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(7,'44 mm','Watch case: 44 mm',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(8,'S','Size: Small',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(9,'M','Size: Medium',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(10,'L','Size: Large',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(11,'XL','Size: Extra Large',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(12,'UK 6','Shoe size: UK 6',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(13,'UK 7','Shoe size: UK 7',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(14,'UK 8','Shoe size: UK 8',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(15,'UK 9','Shoe size: UK 9',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(16,'UK 10','Shoe size: UK 10',1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05');
/*!40000 ALTER TABLE `portion_master` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: modifier_master
-- ============================================================

DROP TABLE IF EXISTS `modifier_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modifier_master` (
  `modifier_id` int NOT NULL AUTO_INCREMENT,
  `modifier_name` varchar(100) NOT NULL,
  `modifier_value` varchar(100) NOT NULL,
  `additional_price` decimal(10,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`modifier_id`),
  KEY `fk_modifiers_created_by` (`created_by`),
  KEY `fk_modifiers_updated_by` (`updated_by`),
  CONSTRAINT `fk_modifiers_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_modifiers_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `modifier_master` WRITE;
/*!40000 ALTER TABLE `modifier_master` DISABLE KEYS */;
INSERT INTO `modifier_master` VALUES
(1,'Color','Black',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(2,'Color','Blue',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(3,'Color','Natural Titanium',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(4,'Color','Titanium Gray',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(5,'Color','Titanium Black',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(6,'Color','Flowy Emerald',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(7,'Color','Silky Black',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(8,'Color','White',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(9,'RAM','8 GB',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(10,'RAM','12 GB',2000.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(11,'Strap Material','Silicone',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(12,'Strap Material','Metal',3000.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(13,'Strap Color','Black',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(14,'Strap Color','Blue',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(15,'Color','Navy Blue',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(16,'Color','Red',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(17,'Color','Grey',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(18,'Wash','Dark Wash',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(19,'Wash','Light Wash',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(20,'Color','Black/Red',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(21,'Color','Grey/Blue',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(22,'Pattern','Floral Pink',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(23,'Pattern','Floral Blue',0.00,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05');
/*!40000 ALTER TABLE `modifier_master` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: product_master
-- ============================================================

DROP TABLE IF EXISTS `product_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_master` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text,
  `short_description` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `discounted_price` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `category_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `idx_products_category` (`category_id`),
  KEY `fk_products_created_by` (`created_by`),
  KEY `fk_products_updated_by` (`updated_by`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `category_master` (`category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_products_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_master` WRITE;
/*!40000 ALTER TABLE `product_master` DISABLE KEYS */;
INSERT INTO `product_master` VALUES
(1,'iphone_15_pro_max','Apple iPhone 15 Pro Max','Flagship Apple smartphone with A17 chip and ProMotion display.','iPhone 15 Pro Max 256 GB',159999.00,149999.00,25,16,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(2,'iphone_14','Apple iPhone 14','Powerful Apple smartphone with advanced camera system.','iPhone 14 128 GB',79999.00,74999.00,40,15,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(3,'samsung_galaxy_s24_ultra','Samsung Galaxy S24 Ultra','Samsung flagship with high refresh rate AMOLED and quad camera.','Galaxy S24 Ultra 256 GB',139999.00,129999.00,30,8,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(4,'samsung_galaxy_a55','Samsung Galaxy A55','Mid-range Samsung Galaxy A-series smartphone.','Galaxy A55 128 GB',34999.00,29999.00,60,9,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(5,'redmi_note_13_pro','Redmi Note 13 Pro','Xiaomi Redmi Note series smartphone with great value.','Redmi Note 13 Pro 8GB/256GB',27999.00,24999.00,80,10,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(6,'poco_x6','POCO X6','POCO X-series smartphone focused on performance.','POCO X6 8GB/256GB',22999.00,20999.00,70,11,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(7,'oneplus_12','OnePlus 12','OnePlus flagship with fast charging and clean UI.','OnePlus 12 12GB/256GB',64999.00,61999.00,35,12,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(8,'oneplus_nord_3','OnePlus Nord 3','Upper mid-range OnePlus Nord series smartphone.','OnePlus Nord 3 8GB/128GB',32999.00,29999.00,55,13,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(9,'samsung_55_qled_4k','Samsung 55 inch QLED 4K Smart TV','Samsung 55 inch QLED 4K Smart TV with HDR and voice assistant.','Samsung 55\" QLED 4K Smart TV',74999.00,69999.00,20,18,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(10,'lg_43_led_full_hd','LG 43 inch Full HD LED TV','LG 43 inch Full HD LED TV with vivid picture engine.','LG 43\" Full HD LED TV',29999.00,24999.00,25,19,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(11,'apple_watch_series_9','Apple Watch Series 9 GPS 45mm','Apple Watch Series 9 with health sensors and Always-On Retina display.','Apple Watch Series 9 45mm',45999.00,42999.00,30,21,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(12,'galaxy_watch_6','Samsung Galaxy Watch6 Bluetooth 44mm','Samsung Galaxy Watch6 with AMOLED display and fitness tracking.','Galaxy Watch6 44mm',28999.00,25999.00,40,21,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(13,'mi_smart_band_8','Mi Smart Band 8','Mi Smart Band 8 with AMOLED display and 150+ fitness modes.','Mi Smart Band 8',3999.00,3499.00,100,22,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(14,'boat_rockerz_450','boAt Rockerz 450 Bluetooth Headphones','Wireless on-ear headphones with 15 hours playback and deep bass.','boAt Rockerz 450',2499.00,1999.00,120,26,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(15,'sony_wh_1000xm5','Sony WH-1000XM5 Wireless Headphones','Sony flagship noise-cancelling over-ear headphones.','Sony WH-1000XM5',34999.00,32999.00,25,26,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(16,'mens_round_neck_tshirt','Men Round Neck Cotton T-Shirt','Regular fit round neck cotton T-shirt for men.','Men Cotton T-Shirt',799.00,599.00,300,35,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(17,'mens_slim_fit_jeans','Men Slim Fit Jeans','Slim fit stretchable denim jeans for men.','Men Slim Fit Jeans',1999.00,1599.00,180,36,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(18,'mens_sports_shoes','Men Running Sports Shoes','Lightweight running shoes with breathable mesh.','Men Sports Shoes',2499.00,1999.00,120,39,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(19,'womens_floral_dress','Women Floral A-Line Dress','Knee-length floral A-line dress for women.','Women Floral Dress',2499.00,1999.00,160,37,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(20,'womens_sneakers','Women Casual Sneakers','Casual lace-up sneakers for women.','Women Sneakers',2799.00,2299.00,110,42,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05');
/*!40000 ALTER TABLE `product_master` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: product_portion
-- ============================================================

DROP TABLE IF EXISTS `product_portion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_portion` (
  `product_portion_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `portion_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discounted_price` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_portion_id`),
  UNIQUE KEY `unique_product_portion` (`product_id`,`portion_id`),
  KEY `fk_product_portion_portion` (`portion_id`),
  KEY `fk_product_portion_created_by` (`created_by`),
  KEY `fk_product_portion_updated_by` (`updated_by`),
  CONSTRAINT `fk_product_portion_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_product_portion_portion` FOREIGN KEY (`portion_id`) REFERENCES `portion_master` (`portion_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_portion_product` FOREIGN KEY (`product_id`) REFERENCES `product_master` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_portion_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_portion` WRITE;
/*!40000 ALTER TABLE `product_portion` DISABLE KEYS */;
INSERT INTO `product_portion` VALUES
(1,1,2,149999.00,144999.00,10,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(2,1,3,169999.00,164999.00,8,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(3,1,4,189999.00,184999.00,5,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(4,2,1,74999.00,69999.00,20,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(5,2,2,84999.00,79999.00,15,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(6,3,2,129999.00,124999.00,15,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(7,3,3,149999.00,144999.00,10,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(8,4,1,29999.00,27999.00,30,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(9,4,2,34999.00,32999.00,20,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(10,5,1,22999.00,20999.00,40,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(11,5,2,24999.00,22999.00,30,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(12,6,1,19999.00,18499.00,35,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(13,6,2,22999.00,20999.00,25,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(14,7,2,61999.00,59999.00,18,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(15,7,3,69999.00,67999.00,12,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(16,8,1,27999.00,25999.00,28,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(17,8,2,29999.00,27999.00,22,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(18,11,5,40999.00,38999.00,15,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(19,11,6,45999.00,42999.00,12,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(20,12,7,28999.00,25999.00,20,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(21,16,8,799.00,599.00,80,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(22,16,9,799.00,599.00,100,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(23,16,10,799.00,599.00,70,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(24,16,11,799.00,599.00,50,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(25,17,9,1999.00,1599.00,60,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(26,17,10,1999.00,1599.00,70,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(27,17,11,1999.00,1599.00,50,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(28,18,13,2499.00,1999.00,30,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(29,18,14,2499.00,1999.00,40,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(30,18,15,2499.00,1999.00,30,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(31,18,16,2499.00,1999.00,20,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(32,19,8,2499.00,1999.00,50,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(33,19,9,2499.00,1999.00,60,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(34,19,10,2499.00,1999.00,50,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(35,20,12,2799.00,2299.00,35,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(36,20,13,2799.00,2299.00,40,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(37,20,14,2799.00,2299.00,35,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05');
/*!40000 ALTER TABLE `product_portion` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: modifier_portion
-- ============================================================

DROP TABLE IF EXISTS `modifier_portion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modifier_portion` (
  `modifier_portion_id` int NOT NULL AUTO_INCREMENT,
  `modifier_id` int NOT NULL,
  `product_portion_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `additional_price` decimal(10,2) DEFAULT '0.00',
  `stock` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`modifier_portion_id`),
  UNIQUE KEY `unique_modifier_product_portion` (`modifier_id`,`product_portion_id`),
  UNIQUE KEY `unique_modifier_product` (`modifier_id`,`product_id`),
  KEY `fk_modifier_portion_product_portion` (`product_portion_id`),
  KEY `fk_modifier_portion_product` (`product_id`),
  KEY `fk_modifier_portion_created_by` (`created_by`),
  KEY `fk_modifier_portion_updated_by` (`updated_by`),
  CONSTRAINT `fk_modifier_portion_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_modifier_portion_modifier` FOREIGN KEY (`modifier_id`) REFERENCES `modifier_master` (`modifier_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_modifier_portion_product_portion` FOREIGN KEY (`product_portion_id`) REFERENCES `product_portion` (`product_portion_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_modifier_portion_product` FOREIGN KEY (`product_id`) REFERENCES `product_master` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_modifier_portion_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `modifier_portion` WRITE;
/*!40000 ALTER TABLE `modifier_portion` DISABLE KEYS */;
INSERT INTO `modifier_portion` VALUES
(1,1,1,0.00,4,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(2,2,1,0.00,3,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(3,3,1,0.00,3,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(4,1,2,0.00,4,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(5,2,2,0.00,4,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(6,1,3,0.00,5,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(7,4,6,0.00,8,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(8,5,6,0.00,7,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(9,4,7,0.00,5,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(10,5,7,0.00,5,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(11,9,10,0.00,20,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(12,10,10,2000.00,15,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(13,9,11,0.00,15,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(14,10,11,2000.00,10,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(15,6,14,0.00,10,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(16,7,14,0.00,8,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(17,6,15,0.00,6,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(18,7,15,0.00,6,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(19,11,18,0.00,10,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(20,12,18,3000.00,5,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(21,11,19,0.00,8,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(22,12,19,3000.00,4,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(23,15,21,0.00,25,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(24,16,21,0.00,25,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(25,17,21,0.00,30,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(26,15,22,0.00,35,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(27,16,22,0.00,30,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(28,17,22,0.00,35,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(29,15,23,0.00,25,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(30,16,23,0.00,20,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(31,17,23,0.00,25,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(32,18,25,0.00,30,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(33,19,25,0.00,30,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(34,18,26,0.00,35,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(35,19,26,0.00,35,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(36,20,29,0.00,20,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(37,21,29,0.00,20,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(38,20,30,0.00,15,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(39,21,30,0.00,15,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(40,22,33,0.00,30,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(41,23,33,0.00,30,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(42,1,36,0.00,20,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(43,8,36,0.00,20,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05');
/*!40000 ALTER TABLE `modifier_portion` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: product_categories
-- ============================================================

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `product_id` int NOT NULL,
  `category_id` int NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`,`category_id`),
  KEY `fk_product_categories_category` (`category_id`),
  KEY `fk_product_categories_created_by` (`created_by`),
  KEY `fk_product_categories_updated_by` (`updated_by`),
  CONSTRAINT `fk_product_categories_category` FOREIGN KEY (`category_id`) REFERENCES `category_master` (`category_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_categories_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_product_categories_product` FOREIGN KEY (`product_id`) REFERENCES `product_master` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_categories_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES
(1,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(1,2,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(1,4,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(1,16,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(2,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(2,2,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(2,4,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(2,15,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(3,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(3,2,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(3,3,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(3,8,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(4,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(4,2,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(4,3,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(4,9,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(5,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(5,2,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(5,3,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(5,10,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(6,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(6,2,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(6,3,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(6,11,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(7,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(7,2,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(7,3,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(7,12,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(8,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(8,2,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(8,3,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(8,13,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(9,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(9,17,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(9,18,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(10,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(10,17,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(10,19,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(11,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(11,20,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(11,21,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(12,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(12,20,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(12,21,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(13,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(13,20,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(13,22,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(14,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(14,23,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(14,26,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(15,1,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(15,23,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(15,26,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(16,27,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(16,28,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(16,31,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(16,35,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(17,27,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(17,28,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(17,31,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(17,36,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(18,27,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(18,28,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(18,32,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(18,39,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(19,27,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(19,29,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(19,33,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(19,37,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(20,27,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(20,29,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),(20,34,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(20,42,0,1,1,'2026-02-17 10:20:05','2026-02-17 10:20:05');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: product_images  [NEW - from ommm.sql]
-- ============================================================

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `product_portion_id` int DEFAULT NULL,
  `modifier_portion_id` int DEFAULT NULL,
  `image_level` enum('PRODUCT','PORTION','MODIFIER','VARIANT') NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `public_id` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `fk_img_product_portion` (`product_portion_id`),
  KEY `fk_img_modifier_portion` (`modifier_portion_id`),
  KEY `fk_img_created_by` (`created_by`),
  KEY `fk_img_updated_by` (`updated_by`),
  KEY `idx_lookup` (`product_id`,`product_portion_id`,`modifier_portion_id`,`image_level`),
  CONSTRAINT `fk_img_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_img_modifier_portion` FOREIGN KEY (`modifier_portion_id`) REFERENCES `modifier_portion` (`modifier_portion_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_img_product` FOREIGN KEY (`product_id`) REFERENCES `product_master` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_img_product_portion` FOREIGN KEY (`product_portion_id`) REFERENCES `product_portion` (`product_portion_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_img_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES
(1,1,1,2,'PRODUCT','https://res.cloudinary.com/dttrvvjeg/image/upload/v1771496154/products/product_1/product/qcocw3zj21cvdjvvu2ix.png','products/product_1/product/qcocw3zj21cvdjvvu2ix',0,1,NULL,NULL,'2026-02-19 05:22:56','2026-02-19 10:29:15'),
(2,5,NULL,NULL,'PRODUCT','https://res.cloudinary.com/dttrvvjeg/image/upload/v1771479081/products/product_5/product/jczzzkfg575p5asxyar3.png','products/product_5/product/jczzzkfg575p5asxyar3',1,0,NULL,NULL,'2026-02-19 05:31:23','2026-02-19 10:17:54'),
(3,5,NULL,NULL,'PRODUCT','https://res.cloudinary.com/dttrvvjeg/image/upload/v1771480836/products/product_5/product/sjhdunqee9ck0pjl59nm.png','products/product_5/product/sjhdunqee9ck0pjl59nm',0,0,NULL,NULL,'2026-02-19 06:00:37','2026-02-19 06:01:22'),
(4,5,NULL,NULL,'PRODUCT','https://res.cloudinary.com/dttrvvjeg/image/upload/v1771496251/products/product_5/product/uhlyofg6ct7yvasaqxx4.png','products/product_5/product/uhlyofg6ct7yvasaqxx4',0,0,NULL,NULL,'2026-02-19 10:17:33','2026-02-19 10:17:54');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: offer_master
-- Changes: Added category_id, product_id columns + FKs (from ommm.sql)
-- ============================================================

DROP TABLE IF EXISTS `offer_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offer_master` (
  `offer_id` int NOT NULL AUTO_INCREMENT,
  `offer_name` varchar(100) NOT NULL,
  `description` text,
  `offer_type` enum('first_order','time_based','flat_discount','category_discount','product_discount') NOT NULL,
  `discount_type` enum('percentage','fixed_amount') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `maximum_discount_amount` decimal(10,2) NOT NULL,
  `min_purchase_amount` decimal(10,2) DEFAULT '0.00',
  `usage_limit_per_user` int DEFAULT '1',
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`offer_id`),
  KEY `fk_offers_created_by` (`created_by`),
  KEY `fk_offers_updated_by` (`updated_by`),
  CONSTRAINT `fk_offers_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_offers_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `offer_master` WRITE;
/*!40000 ALTER TABLE `offer_master` DISABLE KEYS */;
INSERT INTO `offer_master` VALUES
(1,'10% off all phones','Get 10% discount on all phones above 10000.','category_discount','percentage',10.00,5000.00,10000.00,3,2,NULL,'2024-12-31 18:30:00','2026-12-31 18:29:59',NULL,NULL,1,0,1,1,'2026-02-17 10:20:06','2026-02-17 10:20:06'),
(2,'2000 off Android phones','Flat 2000 discount on Android phones above 15000.','category_discount','fixed_amount',2000.00,2000.00,15000.00,5,3,NULL,'2024-12-31 18:30:00','2026-12-31 18:29:59',NULL,NULL,1,0,1,1,'2026-02-17 10:20:06','2026-02-17 10:20:06'),
(3,'iPhone 15 launch offer','Special launch discount on iPhone 15 Pro Max.','product_discount','fixed_amount',5000.00,5000.00,120000.00,2,NULL,1,'2024-12-31 18:30:00','2026-12-31 18:29:59',NULL,NULL,1,0,1,1,'2026-02-17 10:20:06','2026-02-17 10:20:06');
/*!40000 ALTER TABLE `offer_master` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: offer_product_category  [NEW - from ecommerce-accrete.sql]
-- ============================================================

DROP TABLE IF EXISTS `offer_product_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offer_product_category` (
  `offer_product_category_id` int NOT NULL AUTO_INCREMENT,
  `offer_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`offer_product_category_id`),
  KEY `fk_opc_offer` (`offer_id`),
  KEY `fk_opc_product` (`product_id`),
  KEY `fk_opc_category` (`category_id`),
  KEY `fk_opc_created_by` (`created_by`),
  KEY `fk_opc_updated_by` (`updated_by`),
  CONSTRAINT `fk_opc_offer` FOREIGN KEY (`offer_id`) REFERENCES `offer_master` (`offer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_opc_product` FOREIGN KEY (`product_id`) REFERENCES `product_master` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_opc_category` FOREIGN KEY (`category_id`) REFERENCES `category_master` (`category_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_opc_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_opc_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `offer_product_category` WRITE;
/*!40000 ALTER TABLE `offer_product_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `offer_product_category` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: user_addresses
-- ============================================================

DROP TABLE IF EXISTS `user_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_addresses` (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `address_type` varchar(20) DEFAULT 'shipping',
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) DEFAULT 'USA',
  `is_default` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`address_id`),
  KEY `idx_user_addresses_user` (`user_id`),
  KEY `fk_user_addresses_created_by` (`created_by`),
  KEY `fk_user_addresses_updated_by` (`updated_by`),
  CONSTRAINT `fk_user_addresses_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_user_addresses_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_user_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `user_master` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `user_addresses` WRITE;
/*!40000 ALTER TABLE `user_addresses` DISABLE KEYS */;
INSERT INTO `user_addresses` VALUES
(1,2,'shipping','Rahul Sharma','9876543210','101 MG Road','Near Metro Station','Bengaluru','KA','560001','India',1,0,2,2,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(2,3,'shipping','Priya Singh','9123456780','202 Marine Drive','Sea View Apartments','Mumbai','MH','400001','India',1,0,3,3,'2026-02-17 10:20:05','2026-02-17 10:20:05');
/*!40000 ALTER TABLE `user_addresses` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: order_master
-- ============================================================

DROP TABLE IF EXISTS `order_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_master` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `address_id` int DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `shipping_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `order_status` enum('pending','processing','shipped','delivered','completed','cancelled','refunded') DEFAULT 'pending',
  `payment_status` enum('pending','processing','completed','failed','refunded') DEFAULT 'pending',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `idx_orders_number` (`order_number`),
  KEY `fk_orders_user` (`user_id`),
  KEY `fk_orders_address` (`address_id`),
  KEY `fk_orders_created_by` (`created_by`),
  KEY `fk_orders_updated_by` (`updated_by`),
  CONSTRAINT `fk_orders_address` FOREIGN KEY (`address_id`) REFERENCES `user_addresses` (`address_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_orders_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `user_master` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `order_master` WRITE;
/*!40000 ALTER TABLE `order_master` DISABLE KEYS */;
INSERT INTO `order_master` VALUES
(1,'ORD-2001',4,1,154998.00,7000.00,0.00,10000.00,151998.00,'delivered','completed',0,4,4,'2026-02-17 10:20:05','2026-02-17 12:00:35'),
(2,'ORD-2002',4,2,179998.00,9000.00,0.00,5000.00,183998.00,'delivered','completed',0,4,4,'2026-02-17 10:20:05','2026-02-17 12:00:35');
/*!40000 ALTER TABLE `order_master` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: order_items
-- ============================================================

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_portion_id` int DEFAULT NULL,
  `modifier_id` int DEFAULT NULL,
  `product_name` varchar(100) NOT NULL,
  `portion_value` varchar(50) DEFAULT NULL,
  `modifier_value` varchar(100) DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `tax` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  KEY `fk_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  KEY `fk_order_items_product_portion` (`product_portion_id`),
  KEY `fk_order_items_modifier` (`modifier_id`),
  KEY `fk_order_items_created_by` (`created_by`),
  KEY `fk_order_items_updated_by` (`updated_by`),
  CONSTRAINT `fk_order_items_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_order_items_modifier` FOREIGN KEY (`modifier_id`) REFERENCES `modifier_master` (`modifier_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `order_master` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `product_master` (`product_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_items_product_portion` FOREIGN KEY (`product_portion_id`) REFERENCES `product_portion` (`product_portion_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_items_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES
(1,1,3,6,5,'Samsung Galaxy S24 Ultra','256 GB','Titanium Black',1,124999.00,5000.00,6500.00,126499.00,0,2,2,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(2,1,5,11,9,'Redmi Note 13 Pro','256 GB','8 GB',1,22999.00,5000.00,500.00,18499.00,0,2,2,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(3,1,13,NULL,NULL,'Mi Smart Band 8',NULL,NULL,1,3499.00,0.00,180.00,3679.00,0,2,2,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(4,2,1,2,2,'Apple iPhone 15 Pro Max','512 GB','Blue',1,164999.00,5000.00,7500.00,167499.00,0,3,3,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(5,2,14,NULL,NULL,'boAt Rockerz 450',NULL,NULL,1,1999.00,0.00,100.00,2099.00,0,3,3,'2026-02-17 10:20:05','2026-02-17 10:20:05');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: offer_usage
-- Changes: Added usage_count column (from ommm.sql)
-- ============================================================

DROP TABLE IF EXISTS `offer_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offer_usage` (
  `offer_usage_id` int NOT NULL AUTO_INCREMENT,
  `offer_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `usage_count` int DEFAULT '1',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`offer_usage_id`),
  KEY `fk_offer_usage_offer` (`offer_id`),
  KEY `fk_offer_usage_user` (`user_id`),
  KEY `fk_offer_usage_order` (`order_id`),
  KEY `fk_offer_usage_created_by` (`created_by`),
  KEY `fk_offer_usage_updated_by` (`updated_by`),
  CONSTRAINT `fk_offer_usage_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_offer_usage_offer` FOREIGN KEY (`offer_id`) REFERENCES `offer_master` (`offer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_offer_usage_order` FOREIGN KEY (`order_id`) REFERENCES `order_master` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_offer_usage_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_offer_usage_user` FOREIGN KEY (`user_id`) REFERENCES `user_master` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `offer_usage` WRITE;
/*!40000 ALTER TABLE `offer_usage` DISABLE KEYS */;
INSERT INTO `offer_usage` VALUES
(1,1,2,1,10000.00,1,0,2,2,'2026-02-17 10:20:06','2026-02-17 10:20:06'),
(2,3,3,2,5000.00,1,0,3,3,'2026-02-17 10:20:06','2026-02-17 10:20:06');
/*!40000 ALTER TABLE `offer_usage` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: payment_master
-- ============================================================

DROP TABLE IF EXISTS `payment_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_master` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_method` enum('credit_card','debit_card','paypal','stripe','cash_on_delivery','bank_transfer') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `status` enum('pending','processing','completed','failed','refunded') DEFAULT 'pending',
  `payment_details` text,
  `gateway_response` text,
  `is_refunded` tinyint(1) DEFAULT '0',
  `refund_amount` decimal(10,2) DEFAULT '0.00',
  `processing_started_at` timestamp NULL DEFAULT NULL,
  `succeeded_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `fk_payments_order` (`order_id`),
  KEY `fk_payments_created_by` (`created_by`),
  KEY `fk_payments_updated_by` (`updated_by`),
  CONSTRAINT `fk_payments_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `order_master` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `payment_master` WRITE;
/*!40000 ALTER TABLE `payment_master` DISABLE KEYS */;
INSERT INTO `payment_master` VALUES
(1,1,'TXN-2001','credit_card',151998.00,'INR','completed','Paid with Visa ending 4242','OK',0,0.00,NULL,NULL,NULL,0,2,2,'2026-02-17 10:20:06','2026-02-17 10:20:06'),
(2,2,'TXN-2002','cash_on_delivery',183998.00,'INR','completed','Cash collected on delivery','OK',0,0.00,NULL,NULL,NULL,0,3,3,'2026-02-17 10:20:06','2026-02-17 10:20:06');
/*!40000 ALTER TABLE `payment_master` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: cart_master
-- Changes: Added offer_id, discount_amount columns (from ecommerce-accrete.sql)
-- ============================================================

DROP TABLE IF EXISTS `cart_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_master` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `offer_id` int DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `fk_carts_user` (`user_id`),
  KEY `fk_cart_master_offer` (`offer_id`),
  KEY `fk_carts_created_by` (`created_by`),
  KEY `fk_carts_updated_by` (`updated_by`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `user_master` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_master_offer` FOREIGN KEY (`offer_id`) REFERENCES `offer_master` (`offer_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_carts_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_carts_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cart_master` WRITE;
/*!40000 ALTER TABLE `cart_master` DISABLE KEYS */;
INSERT INTO `cart_master` VALUES
(1,4,NULL,0.00,0,2,2,'2026-02-17 10:20:05','2026-02-17 11:18:24'),
(2,4,NULL,0.00,0,3,3,'2026-02-17 10:20:05','2026-02-17 11:18:24');
/*!40000 ALTER TABLE `cart_master` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: cart_items
-- Changes: Added offer_id column (from ecommerce-accrete.sql)
-- ============================================================

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `cart_item_id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_portion_id` int DEFAULT NULL,
  `modifier_id` int DEFAULT NULL,
  `offer_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_id`),
  KEY `fk_cart_items_cart` (`cart_id`),
  KEY `fk_cart_items_product` (`product_id`),
  KEY `fk_cart_items_product_portion` (`product_portion_id`),
  KEY `fk_cart_items_modifier` (`modifier_id`),
  KEY `fk_cart_items_offer` (`offer_id`),
  KEY `fk_cart_items_created_by` (`created_by`),
  KEY `fk_cart_items_updated_by` (`updated_by`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `cart_master` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_cart_items_modifier` FOREIGN KEY (`modifier_id`) REFERENCES `modifier_master` (`modifier_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cart_items_offer` FOREIGN KEY (`offer_id`) REFERENCES `offer_master` (`offer_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `product_master` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product_portion` FOREIGN KEY (`product_portion_id`) REFERENCES `product_portion` (`product_portion_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES
(1,1,3,6,4,NULL,1,124999.00,0,2,2,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(2,1,5,11,10,NULL,1,22999.00,0,2,2,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(3,1,13,NULL,NULL,NULL,1,3499.00,0,2,2,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(4,2,1,1,3,NULL,1,144999.00,0,3,3,'2026-02-17 10:20:05','2026-02-17 10:20:05'),
(5,2,14,NULL,NULL,NULL,1,1999.00,0,3,3,'2026-02-17 10:20:05','2026-02-17 10:20:05');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: product_reviews
-- ============================================================

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `rating` tinyint NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `review_text` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `is_verified_purchase` tinyint(1) DEFAULT '0',
  `helpful_count` int DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `fk_reviews_product` (`product_id`),
  KEY `fk_reviews_user` (`user_id`),
  KEY `fk_reviews_order` (`order_id`),
  KEY `fk_reviews_created_by` (`created_by`),
  KEY `fk_reviews_updated_by` (`updated_by`),
  CONSTRAINT `fk_reviews_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `order_master` (`order_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `product_master` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user_master` (`user_id`),
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `user_master` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES
(2,1,4,2,5,'Premium iPhone','iPhone 15 Pro Max feels very premium and smooth.','approved',1,2,0,4,4,'2026-02-17 10:20:06','2026-02-17 11:55:01'),
(3,5,4,1,3,'Updated title','Updated review text','pending',1,1,0,4,4,'2026-02-17 12:02:11','2026-02-17 12:03:41'),
(4,13,4,1,3,'Excellent quality','Delivered on time and product is great.','pending',1,2,0,4,5,'2026-02-17 12:06:05','2026-02-17 12:08:43');
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Table: review_helpful  [NEW - from ommm.sql]
-- ============================================================

DROP TABLE IF EXISTS `review_helpful`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_helpful` (
  `id` int NOT NULL AUTO_INCREMENT,
  `review_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_review_user` (`review_id`,`user_id`),
  KEY `fk_review_helpful_user` (`user_id`),
  CONSTRAINT `fk_review_helpful_review` FOREIGN KEY (`review_id`) REFERENCES `product_reviews` (`review_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_helpful_user` FOREIGN KEY (`user_id`) REFERENCES `user_master` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `review_helpful` WRITE;
/*!40000 ALTER TABLE `review_helpful` DISABLE KEYS */;
INSERT INTO `review_helpful` VALUES
(16,3,4,'2026-02-17 12:03:19'),
(17,4,4,'2026-02-17 12:06:59'),
(18,4,5,'2026-02-17 12:08:43');
/*!40000 ALTER TABLE `review_helpful` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-19

-- App Settings Table
CREATE TABLE IF NOT EXISTS `app_settings` (
  `setting_id` INT NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT,
  `setting_type` ENUM('string', 'number', 'boolean', 'password', 'currency', 'timezone') DEFAULT 'string',
  `category` VARCHAR(50) DEFAULT 'general',
  `description` VARCHAR(255),
  `is_deleted` TINYINT(1) DEFAULT 0,
  `created_by` INT,
  `updated_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`),        
  UNIQUE KEY `uk_setting_key` (`setting_key`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- Activity Logs Table
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `log_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT,
  `action` VARCHAR(50) NOT NULL,
  `entity_type` VARCHAR(50),
  `entity_id` VARCHAR(100),
  `details` JSON,
  `ip_address` VARCHAR(45),
  `user_agent` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default settings
INSERT INTO `app_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description`, `created_by`, `updated_by`) VALUES
('site_name', 'ShopSphere', 'string', 'general', 'Website name', 1, 1),
('default_currency', 'INR', 'currency', 'store', 'Default currency', 1, 1),
('tax_rate', '18', 'number', 'store', 'Tax rate percentage', 1, 1)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;
