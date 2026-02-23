import pool from "../configs/db.js";

import mysql from "mysql2/promise";

// Fetch cart items for a user including product and portion details
export const getCart = async (user_id) => {
  const [cart] = await pool.query(
    `select ci.product_id,cm.cart_id,
        ci.quantity,
        ci.product_portion_id, 
        ci.modifier_id
         from cart_items ci join cart_master cm on ci.cart_id  = cm.cart_id  where cm.user_id =? and ci.is_deleted=0`,
    [user_id],
  );

  return cart;
};

// Find primary category for each product
export const getCompareProductCategory = async (productIds) => {
  const [compare] = await pool.query(
    `select product_id,min(category_id) as category_id from
                                        product_categories where product_id in (?)
                                        group by product_id`,
    [productIds],
  );
  return compare;
};

// Retrieve user's default address ID
export const getUserAddress = async (user_id) => {
  const [rows] = await pool.query(
    "select address_id  from user_addresses  where user_id= ?",
    [user_id],
  );
  return rows[0]?.address_id || null;
};

// Fetch product-level discounts from offer master
export const getOfferOnCart = async (userId) => {
  const [rows] = await pool.query(
    "select offer_id from cart_master where user_id = ?",
    [userId],
  );
  return rows;
};
export const getOfferItem = async (cart_id) => {
  const [rows] = await pool.query(
    "select offer_id from cart_items where cart_id = ? ",
    [cart_id],
  );
  return rows;
};
// Insert order into order_master and generate order number
export const insertValue = async (values) => {
  const [rows] = await pool.query(
    ` insert into order_master (order_number,user_id,address_id,
        subtotal,tax_amount,shipping_amount,discount_amount,
        total_amount,order_status ,payment_status, is_deleted,created_by,updated_by)
        values (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    values,
  );

  const order_number = `ORD-200${rows.insertId}`;

  const inserted = await pool.query(
    "UPDATE order_master SET order_number=? WHERE order_id=?",
    [order_number, rows.insertId],
  );
  return rows;
};

// Retrieve all orders for a specific user with pagination
export const getAllOrder = async (userId, limit, offset) => {
  const [rows] = await pool.query(
    "SELECT * FROM order_master WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [userId, limit, offset],
  );
  return rows;
};

// Count all orders for a specific user
export const countAllOrder = async (userId) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as total FROM order_master WHERE user_id = ? AND is_deleted = 0",
    [userId],
  );
  return rows[0].total;
};

// Get price for a specific product portion
export const getPortionPrice = async (productId, portionId) => {
  const [rows] = await pool.query(
    "select price from product_portion where product_id=? and product_portion_id=?",
    [productId, portionId],
  );
  return rows;
};

// Fetch product master details (name, price, category) for given product IDs
export const getProducts = async (productsIds) => {
  const [products] = await pool.query(
    `SELECT name,price,product_id, category_id FROM product_master WHERE product_id IN (?)`,
    [productsIds],
  );
  return products;
};

// Get portion values for portions used in order items
export const getPortionValue = async (portionIds) => {
  const [rows] = await pool.query(
    "select portion_id, portion_value from portion_master where portion_id in (?)",
    [portionIds],
  );
  return rows;
};

// Get modifier values for modifiers used in order items
export const getModifierValue = async (modifierIds) => {
  const [rows] = await pool.query(
    "select modifier_id, modifier_value from modifier_master where modifier_id in (?)",
    [modifierIds],
  );
  return rows;
};

// Find root category using recursive query for tax classification
export const getRootCategoryId = async (categoryId) => {
  const query = `
  WITH RECURSIVE cat_tree AS (
      SELECT category_id, parent_id
      FROM category_master
      WHERE category_id = ?

      UNION ALL

      SELECT c.category_id, c.parent_id
      FROM category_master c
      JOIN cat_tree ct
          ON c.category_id = ct.parent_id
  )
  SELECT category_id
  FROM cat_tree
  WHERE parent_id IS NULL;
  `;

  const [rows] = await pool.query(query, [categoryId]);
  return rows;
};

// Fetch category-level discounts from offer master
export const getDisCountOnCat = async (categoryId) => {
  const [rows] = await pool.query(
    `select discount_value, discount_type, category_id from offer_master where category_id= ? `,
    [categoryId],
  );
  return rows;
};

// Get discount value for a specific offer id
export const getOfferOnId = async (offer_id) => {
  const [rows] = await pool.query(
    "SELECT discount_value FROM offer_master WHERE offer_id = ?",
    [offer_id],
  );

  return rows[0]?.discount_value || null;
};

// Get offer details (type and value)
export const getOfferDetails = async (offer_id) => {
  const [rows] = await pool.query(
    "SELECT discount_type, discount_value FROM offer_master WHERE offer_id = ?",
    [offer_id],
  );
  return rows;
};

// Get single order by id (for ownership checks)
export const getOrderById = async (order_id) => {
  const [rows] = await pool.query(
    "SELECT order_id, user_id, order_status FROM order_master WHERE order_id = ? AND is_deleted = 0",
    [order_id],
  );
  return rows[0] || null;
};

// Hardened updateOrderStatus (supports audit and optional ownership check)
export const updateOrderStatus = async (
  order_id,
  status,
  updated_by = null,
  ownerUserId = null,
) => {
  const params = [];
  const setParts = ["order_status = ?", "updated_at = NOW()"];
  params.push(status);

  if (updated_by !== null) {
    setParts.push("updated_by = ?");
    params.push(updated_by);
  }

  let sql = `UPDATE order_master SET ${setParts.join(", ")} WHERE order_id = ?`;
  params.push(order_id);

  if (ownerUserId !== null) {
    sql += " AND user_id = ?";
    params.push(ownerUserId);
  }

  const [result] = await pool.query(sql, params);
  return result; // caller should check result.affectedRows
};

// Optional: enforce allowed transitions inside model (recommended)
const ORDER_TRANSITIONS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export const updateOrderStatusWithTransition = async (
  order_id,
  newStatus,
  updated_by = null,
  ownerUserId = null,
) => {
  // validate status
  if (!Object.prototype.hasOwnProperty.call(ORDER_TRANSITIONS, newStatus)) {
    return { affectedRows: 0, reason: "INVALID_STATUS" };
  }

  // fetch current status + optional owner check
  const [rowsFetch] = await pool.query(
    "SELECT order_status, user_id FROM order_master WHERE order_id = ? AND is_deleted = 0",
    [order_id],
  );
  const row = rowsFetch[0];
  if (!row) return { affectedRows: 0, reason: "NOT_FOUND" };

  if (ownerUserId !== null && row.user_id !== ownerUserId) {
    return { affectedRows: 0, reason: "NOT_OWNER" };
  }

  const current = row.order_status;
  if (current === newStatus) return { affectedRows: 0, reason: "NO_CHANGE" };

  const allowed = ORDER_TRANSITIONS[current] || [];
  if (!allowed.includes(newStatus)) {
    return { affectedRows: 0, reason: "INVALID_TRANSITION", allowed };
  }

  // perform update
  const params = [];
  const setParts = ["order_status = ?", "updated_at = NOW()"];
  params.push(newStatus);

  if (updated_by !== null) {
    setParts.push("updated_by = ?");
    params.push(updated_by);
  }

  let sql = `UPDATE order_master SET ${setParts.join(", ")} WHERE order_id = ?`;
  params.push(order_id);

  if (ownerUserId !== null) {
    sql += " AND user_id = ?";
    params.push(ownerUserId);
  }

  const [result] = await pool.query(sql, params);
  return result; // check result.affectedRows and/or combine with earlier reasons if needed
};

// Soft-delete an order
export const setOrderDeleted = async (order_id) => {
  const [rows] = await pool.query(
    `UPDATE order_master SET is_deleted = 1 WHERE order_id = ?`,
    [order_id],
  );
  return rows;
};

// Admin: fetch all orders with pagination
export const getAllOrdersAdmin = async (limit, offset) => {
  const [rows] = await pool.query(
    "SELECT * FROM order_master ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset],
  );
  return rows;
};

// Admin: count all orders
export const countAllOrdersAdmin = async () => {
  const [rows] = await pool.query("SELECT COUNT(*) as total FROM order_master");
  return rows[0].total;
};

// Admin: get count of items grouped by product
export const getAllItemsByCountAdmin = async () => {
  const [rows] = await pool.query(
    `SELECT product_id, COUNT(*) as count FROM order_items GROUP BY product_id`,
  );
  return rows;
};

// Admin: fetch all order items
export const getAllItemsAdmin = async () => {
  const [rows] = await pool.query(`SELECT * FROM order_items`);
  return rows;
};
