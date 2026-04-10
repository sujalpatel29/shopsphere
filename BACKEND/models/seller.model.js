import pool from "../configs/db.js";

export const createSellerProfile = async (data) => {
  const {
    seller_id,
    business_name,
    business_description,
    business_address,
    phone,
    gst_number,
    bank_account_number,
    bank_ifsc_code,
    bank_account_holder
  } = data;

  const sql = `
    INSERT INTO seller_profiles (
      seller_id, business_name, business_description, business_address,
      phone, gst_number, bank_account_number, bank_ifsc_code, bank_account_holder
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(sql, [
    seller_id,
    business_name,
    business_description || null,
    business_address || null,
    phone || null,
    gst_number || null,
    bank_account_number || null,
    bank_ifsc_code || null,
    bank_account_holder || null
  ]);

  return result;
};

export const getSellerProfileByUserId = async (sellerId) => {
  const sql = `
    SELECT sp.*, u.name, u.email
    FROM seller_profiles sp
    JOIN user_master u ON u.user_id = sp.seller_id
    WHERE sp.seller_id = ?
  `;

  const [result] = await pool.query(sql, [sellerId]);
  return result;
};

export const getSellerProfileById = async (sellerProfileId) => {
  const sql = `
    SELECT sp.*, u.name, u.email, u.created_at as user_created_at
    FROM seller_profiles sp
    JOIN user_master u ON u.user_id = sp.seller_id
    WHERE sp.seller_profile_id = ?
  `;

  const [result] = await pool.query(sql, [sellerProfileId]);
  return result;
};

export const updateSellerProfile = async (sellerId, data) => {
  const fields = [];
  const values = [];

  if (data.business_name !== undefined) {
    fields.push("business_name = ?");
    values.push(data.business_name);
  }
  if (data.business_description !== undefined) {
    fields.push("business_description = ?");
    values.push(data.business_description);
  }
  if (data.business_address !== undefined) {
    fields.push("business_address = ?");
    values.push(data.business_address);
  }
  if (data.phone !== undefined) {
    fields.push("phone = ?");
    values.push(data.phone);
  }
  if (data.gst_number !== undefined) {
    fields.push("gst_number = ?");
    values.push(data.gst_number);
  }
  if (data.bank_account_number !== undefined) {
    fields.push("bank_account_number = ?");
    values.push(data.bank_account_number);
  }
  if (data.bank_ifsc_code !== undefined) {
    fields.push("bank_ifsc_code = ?");
    values.push(data.bank_ifsc_code);
  }
  if (data.bank_account_holder !== undefined) {
    fields.push("bank_account_holder = ?");
    values.push(data.bank_account_holder);
  }

  if (fields.length === 0) {
    return { affectedRows: 0 };
  }

  values.push(sellerId);
  const sql = `UPDATE seller_profiles SET ${fields.join(", ")}, updated_at = NOW() WHERE seller_id = ?`;

  const [result] = await pool.query(sql, values);
  return result;
};

export const getAllSellers = async (filters = {}) => {
  let sql = `
    SELECT sp.*, u.name, u.email, u.created_at as user_created_at, u.is_blocked
    FROM seller_profiles sp
    JOIN user_master u ON u.user_id = sp.seller_id
    WHERE 1=1
  `;
  const values = [];

  if (filters.status) {
    sql += " AND sp.verification_status = ?";
    values.push(filters.status);
  }

  if (filters.search) {
    sql += " AND (u.name LIKE ? OR u.email LIKE ? OR sp.business_name LIKE ?)";
    const term = `%${filters.search}%`;
    values.push(term, term, term);
  }

  sql += " ORDER BY sp.created_at DESC";

  const [result] = await pool.query(sql, values);
  return result;
};

export const getSellersCount = async (filters = {}) => {
  let sql = `
    SELECT COUNT(*) as total
    FROM seller_profiles sp
    JOIN user_master u ON u.user_id = sp.seller_id
    WHERE 1=1
  `;
  const values = [];

  if (filters.status) {
    sql += " AND sp.verification_status = ?";
    values.push(filters.status);
  }

  const [result] = await pool.query(sql, values);
  return result[0]?.total || 0;
};

export const verifySeller = async (sellerId, status, verifiedBy) => {
  const sql = `
    UPDATE seller_profiles
    SET verification_status = ?, verified_by = ?, verified_at = NOW()
    WHERE seller_id = ?
  `;
  const [result] = await pool.query(sql, [status, verifiedBy, sellerId]);
  return result;
};

export const updateUserToSeller = async (userId) => {
  const sql = `UPDATE user_master SET is_seller = 1, seller_status = 'pending', role = 'seller' WHERE user_id = ?`;
  const [result] = await pool.query(sql, [userId]);
  return result;
};

export const setUserSellerStatus = async (userId, status) => {
  const sql = `UPDATE user_master SET seller_status = ?, role = CASE WHEN ? = 'approved' THEN 'seller' ELSE role END WHERE user_id = ?`;
  const [result] = await pool.query(sql, [status, status, userId]);
  return result;
};

export const isUserSeller = async (userId) => {
  const [rows] = await pool.query(
    "SELECT is_seller, seller_status FROM user_master WHERE user_id = ?",
    [userId]
  );
  return rows[0]?.is_seller === 1 ? rows[0] : null;
};

export const deleteSellerProfile = async (sellerId) => {
  const sql = `DELETE FROM seller_profiles WHERE seller_id = ?`;
  const [result] = await pool.query(sql, [sellerId]);
  return result;
};
