// Modifier Model - Database operations for modifier_master and modifier_portion tables

import pool from "../configs/db.js";

// ============================================================================
// MODIFIER MASTER FUNCTIONS
// ============================================================================

// Get all active modifiers
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

// Get a single modifier by ID
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
            AND is_deleted = 0`,
    [id],
  );
  return rows[0] || null;
}

// Create a new modifier
async function createModifier({
  modifier_name,
  modifier_value,
  additional_price,
  created_by,
}) {
  const [result] = await pool.query(
    `INSERT INTO modifier_master (
            modifier_name,
            modifier_value,
            additional_price,
            created_by
        ) VALUES (?, ?, ?, ?)`,
    [modifier_name, modifier_value, additional_price || 0.0, created_by],
  );
  return result.insertId;
}

// Update an existing modifier
async function updateModifier(
  modifier_id,
  { modifier_name, modifier_value, additional_price, is_active, updated_by },
) {
  await pool.query(
    `UPDATE modifier_master
        SET modifier_name = ?,
            modifier_value = ?,
            additional_price = ?,
            is_active = ?,
            updated_by = ?
        WHERE modifier_id = ?
          AND is_deleted = 0`,
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

// Soft delete a modifier
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

// Toggle modifier active status
async function toggleModifierActive(modifier_id, updated_by) {
  await pool.query(
    `UPDATE modifier_master
        SET is_active = NOT is_active,
            updated_by = ?                    
        WHERE modifier_id = ? AND is_deleted = 0`,
    [updated_by, modifier_id],
  );
  return true;
}

// Partial update modifier (update only provided fields)
async function patchModifier(modifier_id, updates) {
  const fields = [];
  const values = [];

  // Build dynamic query based on provided fields
  if (updates.modifier_name !== undefined) {
    fields.push("modifier_name = ?");
    values.push(updates.modifier_name);
  }
  if (updates.modifier_value !== undefined) {
    fields.push("modifier_value = ?");
    values.push(updates.modifier_value);
  }
  if (updates.additional_price !== undefined) {
    fields.push("additional_price = ?");
    values.push(updates.additional_price);
  }
  if (updates.is_active !== undefined) {
    fields.push("is_active = ?");
    values.push(updates.is_active);
  }

  // Add updated_by
  if (updates.updated_by !== undefined) {
    fields.push("updated_by = ?");
    values.push(updates.updated_by);
  }

  // Add modifier_id to values
  values.push(modifier_id);

  await pool.query(
    `UPDATE modifier_master 
     SET ${fields.join(", ")} 
     WHERE modifier_id = ? AND is_deleted = 0`,
    values,
  );
  return true;
}

// ============================================================================
// MODIFIER PORTION FUNCTIONS
// ============================================================================

// Get all portions for a specific modifier (with JOIN)
async function getModifierPortions(modifier_id) {
  const [rows] = await pool.query(
    `SELECT mp.modifier_portion_id,
                mp.additional_price,
                mp.stock,
                mp.is_active,
                pm.portion_value
           FROM modifier_portion mp
           JOIN product_portion pp ON pp.product_portion_id = mp.product_portion_id
           JOIN portion_master pm ON pm.portion_id = pp.portion_id
          WHERE mp.modifier_id = ?
            AND mp.is_deleted = 0`,
    [modifier_id],
  );
  return rows;
}

// Create a new modifier-portion link
async function createModifierPortion({
  modifier_id,
  product_portion_id,
  additional_price,
  stock,
  created_by,
}) {
  const [result] = await pool.query(
    `INSERT INTO modifier_portion (
            modifier_id,
            product_portion_id,
            additional_price,
            stock,
            created_by
        ) VALUES (?, ?, ?, ?, ?)`,
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

// Update an existing modifier portion
async function updateModifierPortion(
  modifier_portion_id,
  { additional_price, stock, is_active, updated_by },
) {
  await pool.query(
    `UPDATE modifier_portion
        SET additional_price = ?,
            stock = ?,
            is_active = ?,
            updated_by = ?
        WHERE modifier_portion_id = ?
          AND is_deleted = 0`,
    [additional_price, stock, is_active, updated_by, modifier_portion_id],
  );
  return true;
}

// Soft delete a modifier portion
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

// Toggle modifier portion active status
async function toggleModifierPortionActive(modifier_portion_id, updated_by) {
  await pool.query(
    `UPDATE modifier_portion
    SET is_active = NOT is_active, updated_by = ?
    WHERE modifier_portion_id = ? AND is_deleted = 0`,
    [updated_by, modifier_portion_id],
  );
  return true;
}

// Partial update modifier portion (update only provided fields)
async function patchModifierPortion(modifier_portion_id, updates) {
  const fields = [];
  const values = [];

  // Build dynamic query based on provided fields
  if (updates.additional_price !== undefined) {
    fields.push("additional_price = ?");
    values.push(updates.additional_price);
  }
  if (updates.stock !== undefined) {
    fields.push("stock = ?");
    values.push(updates.stock);
  }
  if (updates.is_active !== undefined) {
    fields.push("is_active = ?");
    values.push(updates.is_active);
  }

  // Add updated_by
  if (updates.updated_by !== undefined) {
    fields.push("updated_by = ?");
    values.push(updates.updated_by);
  }

  // Add modifier_portion_id to values
  values.push(modifier_portion_id);

  await pool.query(
    `UPDATE modifier_portion
     SET ${fields.join(", ")}
     WHERE modifier_portion_id = ? AND is_deleted = 0`,
    values,
  );
  return true;
}

export {
  getAllModifiers,
  getModifierById,
  createModifier,
  updateModifier,
  deleteModifier,
  toggleModifierActive,
  patchModifier,
  getModifierPortions,
  createModifierPortion,
  updateModifierPortion,
  deleteModifierPortion,
  toggleModifierPortionActive,
  patchModifierPortion,
};
