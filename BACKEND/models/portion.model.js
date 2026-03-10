import pool from "../configs/db.js";
import { registerUser } from "../controllers/User.controller.js";

// Portion creation operations
export const createPortion = {
  // Insert new portion into database
  create: async (portionData) => {
    const values = [
      portionData.portion_value,
      portionData.description ?? null,
      portionData.is_active !== undefined ? portionData.is_active : 1,
      portionData.created_by,
    ];

    const query = `
      INSERT INTO portion_master 
        (portion_value, description, is_active, is_deleted, created_by, created_at) 
      VALUES (?, ?, ?, 0, ?, NOW())
    `;

    const [result] = await pool.query(query, values);
    return result.insertId;
  },

  // Verify if portion value already exists
  checkPortionValueExists: async (portion_value) => {
    const query = `SELECT portion_id from  portion_master where portion_value = ? and is_deleted = 0`;
    const [rows] = await pool.query(query, [portion_value]);
    return rows.length > 0;
  },
};

// Retrieve all active portions from database
export const getAllPortion = async () => {
  const query = `SELECT 
        pm.portion_id,
        pm.portion_value,
        pm.description,
        pm.is_active,
        pm.created_by,
        pm.updated_by,
        pm.created_at,
        pm.updated_at
      FROM portion_master pm where is_deleted = false`;

  const [rows] = await pool.query(query);
  return rows;
};

// Fetch single portion by ID
export const getPortionById = async (portion_id) => {
  const query = `  SELECT 
        pm.portion_id,
        pm.portion_value,
        pm.description,
        pm.is_active,
        pm.created_by,
        pm.updated_by,
        pm.created_at,
        pm.updated_at
      FROM portion_master pm where portion_id = ? and is_deleted = 0`;

  const [rows] = await pool.query(query, [portion_id]);
  return rows[0] || null;
};

// Update portion details
export const updatePortion = async (
  portion_id,
  portion_value,
  description,
  is_active,
  updated_by,
) => {
  const query = `
    UPDATE portion_master SET portion_value = ?, description = ?, is_active = ?, updated_by = ? WHERE portion_id = ? AND is_deleted = 0; `;

  const [rows] = await pool.query(query, [
    portion_value,
    description,
    is_active,
    updated_by,
    portion_id,
  ]);
  return rows.affectedRows > 0;
};

// Toggle active status of portion
export const toggleActivePortion = async (portion_id, updated_by) => {
  const query = `UPDATE portion_master SET is_active = NOT is_active, updated_by = ? WHERE portion_id = ? AND is_deleted = 0`;

  const [result] = await pool.query(query, [updated_by, portion_id]);

  return result.affectedRows > 0;
};

// Soft delete portion (mark as deleted)
export const deletePortion = async (portion_id, updated_by) => {
  const query = `update portion_master set is_deleted = 1, updated_by = ? where portion_id = ? and is_deleted = 0;`;

  const [rows] = await pool.query(query, [updated_by, portion_id]);
  return rows.affectedRows > 0;
};

//  product_portion table



// Assign portion the product
export const AssignPortionTOProduct = {
  create: async (portionData) => {
    const price = portionData.price;
    const discountedPrice = portionData.discounted_price ?? null;
    const stock = portionData.stock;
    const isActive = portionData.is_active !== undefined ? portionData.is_active : 1;
    const createdBy = portionData.created_by;

    // Use ON DUPLICATE KEY UPDATE to restore soft-deleted records
    const query = `
      INSERT INTO product_portion
        (product_id, portion_id, price, discounted_price, stock, is_active, is_deleted, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, NOW())
      ON DUPLICATE KEY UPDATE
        price = VALUES(price),
        discounted_price = VALUES(discounted_price),
        stock = VALUES(stock),
        is_active = VALUES(is_active),
        is_deleted = 0,
        updated_by = VALUES(created_by),
        updated_at = NOW()
    `;

    const values = [
      portionData.product_id,
      portionData.portion_id,
      price,
      discountedPrice,
      stock,
      isActive,
      createdBy,
    ];

    const [result] = await pool.query(query, values);

    // insertId works for both INSERT and ON DUPLICATE KEY UPDATE
    // For updates, we need to look up by product_id + portion_id
    const lookupId = result.insertId || null;
    const lookupQuery = lookupId
      ? `WHERE pp.product_portion_id = ?`
      : `WHERE pp.product_id = ? AND pp.portion_id = ? AND pp.is_deleted = 0`;
    const lookupValues = lookupId
      ? [lookupId]
      : [portionData.product_id, portionData.portion_id];

    const [rows] = await pool.query(
      `SELECT
      pp.product_portion_id,
      pp.product_id,
      pm.name AS product_name,
      pp.portion_id,
      po.portion_value,
      pp.price,
      pp.discounted_price,
      pp.stock,
      pp.is_active,
      pp.created_at
      FROM product_portion pp
      JOIN product_master pm ON pm.product_id = pp.product_id
      JOIN portion_master po ON po.portion_id = pp.portion_id
      ${lookupQuery}`,
      lookupValues,
    );

    return rows[0];
  },

  // Check if product exists
  checkProductExists: async (product_id) => {
    const query = `
      SELECT product_id FROM product_master 
      WHERE product_id = ? AND is_deleted = 0
    `;
    const [rows] = await pool.query(query, [product_id]);
    return rows.length > 0;
  },

  // Check if portion exists
  checkPortionExists: async (portion_id) => {
    const query = `
      SELECT portion_id FROM portion_master 
      WHERE portion_id = ? AND is_deleted = 0
    `;
    const [rows] = await pool.query(query, [portion_id]);
    return rows.length > 0;
  },

  // Check if product-portion combination already exists
  checkProductPortionExists: async (product_id, portion_id) => {
    const query = `
      SELECT product_portion_id FROM product_portion 
      WHERE product_id = ? AND portion_id = ? AND is_deleted = 0
    `;
    const [rows] = await pool.query(query, [product_id, portion_id]);
    return rows.length > 0;
  },
};

// get all portions for a specific product (user)
export const getProductPortions = async (product_id) => {
  const query = `
    SELECT 
      pp.product_portion_id,
      pp.product_id,
      pm.name AS product_name,
      pp.portion_id,
      po.portion_value,
      po.description AS portion_description,
      pp.price,
      pp.discounted_price,
      pp.stock,
      pp.is_active,
      pp.created_by,
      pp.updated_by,
      pp.created_at,
      pp.updated_at
    FROM product_portion pp
    JOIN product_master pm ON pm.product_id = pp.product_id
    JOIN portion_master po ON po.portion_id = pp.portion_id
    WHERE pp.product_id = ? AND pp.is_deleted = 0
  `;

  const values = [product_id];

  const [result] = await pool.query(query, values);
  return result;
};

// get single product-portion by ID (user)
export const getProductPortionById = async (product_portion_id) => {
  const query = `
    SELECT 
      pp.product_portion_id,
      pp.product_id,
      pm.name AS product_name,
      pm.description AS product_description,
      pp.portion_id,
      po.portion_value,
      po.description AS portion_description,
      pp.price,
      pp.discounted_price,
      pp.stock,
      pp.is_active,
      pp.created_by,
      pp.updated_by,
      pp.created_at,
      pp.updated_at
    FROM product_portion pp
    JOIN product_master pm ON pm.product_id = pp.product_id
    JOIN portion_master po ON po.portion_id = pp.portion_id
    WHERE pp.product_portion_id = ? AND pp.is_deleted = 0
  `;

  const [result] = await pool.query(query, [product_portion_id]);
  return result[0] || null;
};

// Get all product portions (for admin listing)
export const getAllProductPortions = async () => {
  let query = `
    SELECT 
      pp.product_portion_id,
      pp.product_id,
      pm.name AS product_name,
      pp.portion_id,
      po.portion_value,
      pp.price,
      pp.discounted_price,
      pp.stock,
      pp.is_active,
      pp.created_at
    FROM product_portion pp
    JOIN product_master pm ON pm.product_id = pp.product_id
    JOIN portion_master po ON po.portion_id = pp.portion_id
    WHERE pp.is_deleted = 0
  `;

  const [result] = await pool.query(query);
  return result;
};


// Update product portion
export const updateProductPortion = async (product_portion_id, data, updated_by) => {
  const fields = [];
  const values = [];

  if (data.price !== undefined) {
    fields.push("price = ?");
    values.push(data.price);
  }

  if (data.discounted_price !== undefined) {
    if (data.discounted_price > data.price) {
      throw new Error("INVALID_DISCOUNT");
    }
    fields.push("discounted_price = ?");
    values.push(data.discounted_price);
  }

  if (data.stock !== undefined) {
    if (data.stock < 0) {
      throw new Error("INVALID_STOCK");
    }
    fields.push("stock = ?");
    values.push(data.stock);
  }

  if (data.is_active !== undefined) {
    fields.push("is_active = ?");
    values.push(data.is_active);
  }

  if (fields.length === 0) {
    throw new Error("NO_FIELDS_TO_UPDATE");
  }

  fields.push("updated_by = ?");
  values.push(updated_by);

  values.push(product_portion_id);

  await pool.query(
    `
    UPDATE product_portion
    SET ${fields.join(", ")}
    WHERE product_portion_id = ?
    AND is_deleted = 0
    `,
    values,
  );

  // Return updated record
  return await getProductPortionById(product_portion_id);
};

// Toggle active status of product-portion
export const toggleActiveProductPortion = async (product_portion_id, updated_by) => {
  const query = `
    UPDATE product_portion
    SET 
      is_active = CASE 
        WHEN is_active = 1 THEN 0 
        ELSE 1 
      END,
      updated_by = ?
    WHERE product_portion_id = ? AND is_deleted = 0
  `;

  const [result] = await pool.query(query, [updated_by, product_portion_id]);
  return result.affectedRows > 0;
};


// Soft delete product-portion (mark as deleted)
export const deleteProductPortion = async (product_portion_id, updated_by) => {
  const query = `
    UPDATE product_portion 
    SET is_deleted = 1, updated_by = ?
    WHERE product_portion_id = ? AND is_deleted = 0
  `;

  const [result] = await pool.query(query, [updated_by, product_portion_id]);
  return result.affectedRows > 0;
};
