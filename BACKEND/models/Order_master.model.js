import pool from "../configs/db.js"

import mysql from "mysql2/promise";

// Fetch cart items for a user including product and portion details
export const getCart = async (user_id) => {
    const [cart] = await pool.query(`select ci.product_id,cm.cart_id,
        ci.quantity,
        ci.product_portion_id, 
        ci.modifier_id
         from cart_items ci join cart_master cm on ci.cart_id  = cm.cart_id  where cm.user_id =?`, [user_id])
    
    return cart;
}

// Find primary category for each product
export const getCompareProductCategory = async (productIds) => {
    const [compare] = await pool.query(`select product_id,min(category_id) as category_id from
                                        product_categories where product_id in (?)
                                        group by product_id`, [productIds]);
    return compare;
}

// Retrieve user's default address ID
export const getUserAddress = async (user_id) => {
    const [rows] = await pool.query("select address_id  from user_addresses  where user_id= ?", [user_id])
    return rows[0]?.address_id || null;
}

// Fetch product-level discounts from offer master
export const getOfferOnCart = async (userId) => {
    const [rows] = await pool.query("select offer_id from cart_master where user_id = ?",[userId]);
    return rows;
};
export const getOfferItem = async (cart_id) => {
    const [rows] = await pool.query("select offer_id from cart_items where cart_id = ? ",[cart_id]);
    return rows;
};
// Insert order into order_master and generate order number
export const insertValue = async (values) => {

    const [rows] = await pool.query(` insert into order_master (order_number,user_id,address_id,
        subtotal,tax_amount,shipping_amount,discount_amount,
        total_amount,order_status ,payment_status, is_deleted,created_by,updated_by)
        values (?,?,?,?,?,?,?,?,?,?,?,?,?)`, values)

    const order_number = `ORD-200${rows.insertId}`;

    const inserted = await pool.query(
        "UPDATE order_master SET order_number=? WHERE order_id=?",
        [order_number, rows.insertId]
    );
    return rows;
}

// Retrieve all orders for a specific user
export const getAllOrder = async (userId) => {
    const [rows] = await pool.query("select * from Order_master where user_id=  ? ", [userId]);
    return rows;
}

// Get price for a specific product portion
export const getPortionPrice = async (productId, portionId) => {
    const [rows] = await pool.query("select price from product_portion where product_id=? and product_portion_id=?", [productId, portionId]);
    return rows;
}

// Fetch product master details (name, price, category) for given product IDs
export const getProducts = async (productsIds) => {
    const [products] = await pool.query(
        `SELECT name,price,product_id, category_id FROM product_master WHERE product_id IN (?)`,
        [productsIds]
    );
    return products;
}

// Get portion values for portions used in order items
export const getPortionValue= async(portionIds)=>{
    const [rows] = await pool.query("select portion_id, portion_value from portion_master where portion_id in (?)", [portionIds])
    return rows;
}

// Get modifier values for modifiers used in order items
export const getModifierValue= async(modifierIds)=>{
    const [rows] = await pool.query("select modifier_id, modifier_value from modifier_master where modifier_id in (?)", [modifierIds])
    return rows;
}

// Find root category using recursive query for tax classification
export const getRootCategoryId= async (categoryId) =>{
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
}

// Fetch category-level discounts from offer master
export const getDisCountOnCat = async (categoryId) => {
    const [rows] = await pool.query(`select discount_value, discount_type, category_id from offer_master where category_id= ? `, [categoryId])
    return rows;
  }

// Get discount value for a specific offer id
export const getOfferOnId = async (offer_id) => {
    const [rows] = await pool.query(
        "SELECT discount_value FROM offer_master WHERE offer_id = ?",
        [offer_id]
    );

    return rows[0]?.discount_value || null;
};

// Get offer details (type and value)
export const getOfferDetails = async (offer_id) => {
    const [rows] = await pool.query(
        "SELECT discount_type, discount_value FROM offer_master WHERE offer_id = ?",
        [offer_id]
    );
    return rows;
};

// Update an order's status
export const updateOrderStatus = async (order_id, status) => {
    const [rows] = await pool.query(`UPDATE order_master SET order_status = ? WHERE order_id = ?`, [status, order_id]);
    return rows;
};

// Soft-delete an order
export const setOrderDeleted = async (order_id) => {
    const [rows] = await pool.query(`UPDATE order_master SET is_deleted = 1 WHERE order_id = ?`, [order_id]);
    return rows;
};

// Admin: fetch all orders
export const getAllOrdersAdmin = async () => {
    const [rows] = await pool.query(`SELECT * FROM order_master`);
    return rows;
};

// Admin: get count of items grouped by product
export const getAllItemsByCountAdmin = async () => {
    const [rows] = await pool.query(`SELECT product_id, COUNT(*) as count FROM order_items GROUP BY product_id`);
    return rows;
};

// Admin: fetch all order items
export const getAllItemsAdmin = async () => {
    const [rows] = await pool.query(`SELECT * FROM order_items`);
    return rows;
};
