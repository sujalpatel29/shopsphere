/**
 * Modifier Model
 *
 * This file contains all database operations for modifier_master and modifier_portion tables.
 * Modifiers are used to customize products (e.g., "Extra Cheese", "Spicy Level", etc.)
 *
 * @module models/modifier
 */

import pool from "../configs/db.js";

// ============================================================================
// MODIFIER MASTER FUNCTIONS
// ============================================================================

/**
 * Get all active modifiers from the database
 *
 * @returns {Promise<Array>} Array of modifier objects
 * @example
 * const modifiers = await getAllModifiers();
 * // Returns: [{ modifier_id: 1, modifier_name: "Extra Cheese", ... }]
 */
async function getAllModifiers() {
  const [rows] = await pool.query(
    `SELECT modifier_id,
                modifier_name,
                modifier_value,
                additional_price,
                is_active,
                created_at,
                updated_at
           FROM modifier_master
          WHERE is_deleted = 0
          ORDER BY modifier_name`,
  );
  return rows;
}

/**
 * Get a single modifier by its ID
 *
 * @param {number} id - The modifier ID
 * @returns {Promise<Object|null>} Modifier object or null if not found
 * @example
 * const modifier = await getModifierById(5);
 */
async function getModifierById(id) {
  const [rows] = await pool.query(
    `SELECT modifier_id,
                modifier_name,
                modifier_value,
                additional_price,
                is_active,
                created_at,
                updated_at
           FROM modifier_master
          WHERE modifier_id = ?
          LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

/**
 * Create a new modifier
 *
 * @param {Object} data - Modifier data
 * @param {string} data.modifier_name - Name of the modifier (e.g., "Spice Level")
 * @param {string} data.modifier_value - Value of the modifier (e.g., "Extra Spicy")
 * @param {number} data.additional_price - Additional price for this modifier
 * @param {number} data.created_by - User ID who created this modifier
 * @returns {Promise<number>} The ID of the newly created modifier
 * @example
 * const modifierId = await createModifier({
 *   modifier_name: "Extra Cheese",
 *   modifier_value: "Double",
 *   additional_price: 2.50,
 *   created_by: 1
 * });
 */
async function createModifier({
  modifier_name,
  modifier_value,
  additional_price,
  created_by,
}) {
  const [result] = await pool.query(
    `INSERT INTO modifier_master(modifier_name,
            modifier_value,
            additional_price,
            created_by)
            VALUES(?,?,?,?)`,
    [modifier_name, modifier_value, additional_price, created_by],
  );
  return result.insertId;
}

/**
 * Update an existing modifier
 *
 * @param {number} modifier_id - The modifier ID to update
 * @param {Object} data - Updated modifier data
 * @param {string} data.modifier_name - Updated name
 * @param {string} data.modifier_value - Updated value
 * @param {number} data.additional_price - Updated price
 * @param {boolean} data.is_active - Active status (1 or 0)
 * @param {number} data.updated_by - User ID who updated this modifier
 * @returns {Promise<boolean>} True if successful
 */
async function updateModifier(
  modifier_id,
  { modifier_name, modifier_value, additional_price, updated_by, is_active },
) {
  const [result] = await pool.query(
    `UPDATE modifier_master
        SET modifier_name = ?,
            modifier_value = ?,
            additional_price = ?,
            is_active = ?,
            updated_by = ?            
        WHERE modifier_id = ? AND is_deleted = 0`,
    [
      modifier_name,
      modifier_value,
      additional_price,
      is_active,
      updated_by,
      modifier_id,
    ],
  );
  return true;
}

/**
 * Soft delete a modifier (sets is_deleted = 1)
 *
 * Note: We use soft delete to preserve data for audit trails and history.
 * The modifier won't appear in queries but remains in the database.
 *
 * @param {number} modifier_id - The modifier ID to delete
 * @param {number} deleted_by - User ID who deleted this modifier
 * @returns {Promise<boolean>} True if successful
 */
async function deleteModifier(modifier_id, deleted_by) {
  await pool.query(
    `UPDATE modifier_master
        SET is_deleted = 1,
        updated_by = ?  
        WHERE modifier_id = ? AND is_deleted = 0`,
    [deleted_by, modifier_id],
  );
  return true;
}

// ============================================================================
// MODIFIER PORTION FUNCTIONS
// ============================================================================

/**
 * Get all portions associated with a specific modifier
 *
 * This function joins three tables to get complete portion information:
 * - modifier_portion: Links modifiers to product portions
 * - product_portion: Product-specific portion details
 * - portion_master: General portion information (e.g., "Small", "Large")
 *
 * @param {number} modifier_id - The modifier ID
 * @returns {Promise<Array>} Array of modifier portion objects with portion details
 * @example
 * const portions = await getModifierPortions(5);
 * // Returns portions where this modifier is available
 */
async function getModifierPortions(modifier_id) {
  const [rows] = await pool.query(
    `SELECT mp.modifier_portion_id,
        mp.additional_price,
        mp.stock,
        mp.is_active,
        pm.portion_value
        FROM modifier_portion mp
        JOIN product_portion pp ON 
        pp.product_portion_id = mp.product_portion_id
        JOIN portion_master pm ON pm.portion_id = pp.portion_id
        WHERE mp.modifier_id = ?
        AND mp.is_deleted = 0`,
    [modifier_id],
  );
  return rows;
}

/**
 * Create a new modifier-portion link
 *
 * This links a modifier to a specific product portion.
 * Example: Link "Extra Cheese" modifier to "Large Pizza" portion
 *
 * @param {Object} data - Modifier portion data
 * @param {number} data.modifier_id - The modifier ID
 * @param {number} data.product_portion_id - The product portion ID
 * @param {number} [data.additional_price=0] - Additional price for this combination
 * @param {number} [data.stock=0] - Available stock
 * @param {number} data.created_by - User ID who created this link
 * @returns {Promise<number>} The ID of the newly created modifier portion
 */
async function createModifierPortion({
  modifier_id,
  product_portion_id,
  additional_price,
  stock,
  created_by,
}) {
  const [result] = await pool.query(
    `INSERT INTO modifier_portion(modifier_id,
            product_portion_id,
            additional_price,
            stock,
            created_by)
            VALUES(?,?,?,?,?)`,
    [
      modifier_id,
      product_portion_id,
      additional_price || 0.0,
      stock || 0,
      created_by,
    ],
  );
  return result.insertId;
}

/**
 * Update an existing modifier portion
 *
 * @param {number} modifier_portion_id - The modifier portion ID to update
 * @param {Object} data - Updated data
 * @param {number} data.additional_price - Updated price
 * @param {number} data.stock - Updated stock quantity
 * @param {boolean} data.is_active - Active status
 * @param {number} data.updated_by - User ID who updated this
 * @returns {Promise<boolean>} True if successful
 */
async function updateModifierPortion(
  modifier_portion_id,
  { additional_price, stock, updated_by, is_active },
) {
  const [result] = await pool.query(
    `UPDATE modifier_portion
        SET additional_price = ?,
            stock = ?,
            updated_by = ?,
            is_active = ?
        WHERE modifier_portion_id = ? AND is_deleted = 0`,
    [additional_price, stock, updated_by, is_active, modifier_portion_id],
  );
  return true;
}

/**
 * Soft delete a modifier portion
 *
 * @param {number} modifier_portion_id - The modifier portion ID to delete
 * @param {number} deleted_by - User ID who deleted this
 * @returns {Promise<boolean>} True if successful
 */
async function deleteModifierPortion(modifier_portion_id, deleted_by) {
  await pool.query(
    `UPDATE modifier_portion 
        SET is_deleted = 1,
        updated_by = ?
        WHERE modifier_portion_id = ? AND is_deleted = 0`,
    [deleted_by, modifier_portion_id],
  );
  return true;
}

export {
  getAllModifiers,
  getModifierById,
  createModifier,
  updateModifier,
  deleteModifier,
  getModifierPortions,
  createModifierPortion,
  updateModifierPortion,
  deleteModifierPortion,
};
