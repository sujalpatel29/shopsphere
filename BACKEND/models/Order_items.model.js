import pool from "../configs/db.js";
import mysql from "mysql2/promise";

// Fetch product names and IDs from product master table
export const getProducts = async (productIds) => {
  const [products] = await pool.query(
    "select pm.name, pm.product_id from product_master pm where pm.product_id in (?)",
    [productIds]
  );
  return products;
};

// Retrieve all order IDs for a specific user
export const getOrderId = async (userId) => {
  const [order_id] = await pool.query(
    "select order_id from order_master where user_id= ? ",
    [userId]
  );

  return order_id;
};

// Fetch discount values for a category
export const getDiscountOnItem = async (category_id) => {
  const [discount] = await pool.query(
    "select distinct discount_value,category_id from offer_master  where category_id in (?)",
    category_id
  );

  return discount;
};

// Insert order items and clear cart items
export const insertQuery = async (values,cart_id) => {
  const insert = await pool.query(
    `INSERT INTO order_items
     (order_id, product_id, product_portion_id, modifier_id,
      product_name, portion_value, modifier_value,
      quantity, price, discount, tax, total, created_by,updated_by)
     VALUES ?`,
    [values]
  );
  await pool.query("update cart_items set is_deleted=1 where cart_id = ? ",[cart_id])
  return insert;
};

// Retrieve a specific order item by order ID and item ID
export const Orders = async (order_Id,item_Id) => {
  const [rows] = await pool.query(
    `SELECT oi.*, pi.image_url
     FROM order_items oi
     LEFT JOIN product_images pi
       ON pi.product_id = oi.product_id
      AND pi.is_primary = 1
      AND pi.image_level = 'PRODUCT'
      AND pi.is_deleted = 0
     WHERE oi.order_id = ?
       AND oi.is_deleted = 0
     ORDER BY oi.order_item_id DESC`,
    [order_Id],
  );
  return rows;
}
export const OrdersItems = async (order_Id,item_Id) => {
  const [rows] = await pool.query(
    `SELECT oi.*, pi.image_url
     FROM order_items oi
     LEFT JOIN product_images pi
       ON pi.product_id = oi.product_id
      AND pi.is_primary = 1
      AND pi.image_level = 'PRODUCT'
      AND pi.is_deleted = 0
     WHERE oi.order_id = ?
       AND oi.order_item_id = ?
       AND oi.is_deleted = 0
     LIMIT 1`,
    [order_Id, item_Id],
  );
  return rows;
}
