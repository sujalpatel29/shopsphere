CREATE TABLE IF NOT EXISTS `sales_predictions` (
  `prediction_id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `predicted_month` DATE NOT NULL,
  `predicted_qty` DECIMAL(10,2) NOT NULL,
  `predicted_revenue` DECIMAL(12,2) NOT NULL,
  `confidence_score` DECIMAL(5,4) DEFAULT NULL,
  `model_used` VARCHAR(50) DEFAULT 'prophet',
  `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prediction_id`),
  UNIQUE KEY `uq_product_month` (`product_id`, `predicted_month`),
  KEY `idx_sales_predictions_product_id` (`product_id`),
  CONSTRAINT `fk_sales_predictions_product`
    FOREIGN KEY (`product_id`) REFERENCES `product_master` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
