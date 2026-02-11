import pool from "../configs/db.js";

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

async function deleteModifier(modifier_id, deleted_by) {
  await pool.query(
    `UPDATE modifier_master
        SET is_deleted = 1,
        updated_by = ?  
        WHERE modifier_id = ?`,
    [deleted_by, modifier_id],
  );
  return true;
}

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

async function deleteModifierPortion(modifier_portion_id, deleted_by) {
  await pool.query(
    `UPDATE modifier_portion 
        SET is_deleted = 1,
        updated_by = ?
        WHERE modifier_portion_id = ?`,
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
