import pool from "../configs/db.js";

// ============================================================================
// OFFER MODEL QUERIES
// ============================================================================

/**
 * Check whether a conflicting offer already exists for the same time window.
 * Conflict rules:
 * - same `offer_name` and `offer_type`
 * - date range overlap
 * - time range overlap
 * @param {object} offerData - Offer payload used for conflict detection
 * @returns {Promise<boolean>} True when a conflicting offer exists
 */
export const checkOfferExist = async (offerData) => {
  const { offer_name, offer_type, start_date, end_date, start_time, end_time } =
    offerData;
  const [rows] = await pool.query(
    `SELECT offer_id from offer_master 
      WHERE offer_name = ?
      AND offer_type = ?
      AND is_deleted = 0

        -- DATE OVERLAP
       AND start_date < ?
       AND end_date > ?

       -- TIME OVERLAP (handles both normal and midnight-crossing ranges)
       AND (
         CASE 
           WHEN start_time <= end_time THEN
             -- Normal range: stored start <= stored end
             -- Overlap if: incoming_start < stored_end AND incoming_end > stored_start
             ? < end_time AND ? > start_time
           WHEN start_time > end_time THEN
             -- Midnight-crossing range: stored start > stored end
             -- Overlap if: incoming_start > stored_start OR incoming_end < stored_end
             ? > start_time OR ? < end_time
           ELSE 0
         END
       )`,
    [
      offer_name,
      offer_type,
      end_date,
      start_date,
      end_time,
      start_time,
      end_time,
      start_time,
    ],
  );
  return rows.length > 0;
};

/**
 * Create a new offer record
 * @param {object} offerData - Offer payload
 * @returns {Promise<object>} Insert result
 */

export const createOffer = async (offerData, userId) => {
  const {
    offer_name,
    description,
    offer_type,
    discount_type,
    discount_value,
    maximum_discount_amount,
    min_purchase_amount,
    usage_limit_per_user,
    start_date,
    end_date,
    start_time,
    end_time,
  } = offerData;

  const [result] = await pool.query(
    "INSERT INTO `offer_master`(offer_name,description,offer_type,discount_type,discount_value,maximum_discount_amount,min_purchase_amount,usage_limit_per_user,start_date,end_date,start_time,end_time,created_by,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      offer_name,
      description,
      offer_type,
      discount_type,
      discount_value,
      maximum_discount_amount,
      min_purchase_amount,
      usage_limit_per_user,
      start_date,
      end_date,
      start_time,
      end_time,
      userId,
      userId,
    ],
  );
  return result;
};

/**
 * Fetch all offers
 * @returns {Promise<Array>} Offer rows
 */
export const getAllOffer = async () => {
  const [result] = await pool.query("SELECT * FROM `offer_master`");
  return result;
};

/**
 * Fetch a single offer by id (not deleted)
 * @param {number|string} offerId - Offer identifier
 * @returns {Promise<Array>} Offer rows
 */
export const getOfferById = async (offerId) => {
  const [result] = await pool.query(
    "SELECT * FROM `offer_master` WHERE offer_id=? AND is_deleted=0 AND is_active=1",
    [offerId],
  );
  return result;
};

/**
 * Update an existing offer by id (soft-deleted rows are excluded).
 * @param {number|string} offerId - Offer identifier
 * @param {object} offerData - Offer payload
 * @param {number|string} userId - User identifier
 * @returns {Promise<object>} Update result
 */

export const updateOfferById = async (offerId, offerData, userId) => {
  // Allowed fields for update
  const allowedFields = [
    "offer_name",
    "description",
    "offer_type",
    "discount_type",
    "discount_value",
    "maximum_discount_amount",
    "min_purchase_amount",
    "usage_limit_per_user",
    "start_date",
    "end_date",
    "start_time",
    "end_time",
    "is_active",
  ];

  const fields = [];
  const values = [];

  for (const key in offerData) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(offerData[key]);
    }
  }

  if (fields.length === 0) {
    return null; // nothing to update
  }

  fields.push("updated_by = ?");
  values.push(userId);

  const query = `
    UPDATE offer_master
    SET ${fields.join(", ")}
    WHERE offer_id = ?
    AND is_deleted = 0
  `;

  values.push(offerId);

  const [result] = await pool.query(query, values);

  return result;
};

/**
 * Soft delete an offer by id.
 * @param {number|string} offerId - Offer identifier
 * @param {number|string} userId - User identifier
 * @returns {Promise<object>} Update result
 */

export const deleteOfferById = async (offerId, userId) => {
  const [result] = await pool.query(
    `UPDATE offer_master
     SET is_deleted=1, updated_by=?
     WHERE offer_id=? AND is_deleted=0`,
    [userId, offerId],
  );
  return result;
};

/**
 * Update active status for an offer by id (soft-deleted rows are excluded).
 * @param {number|string} offerId - Offer identifier
 * @param {number|string} userId - User identifier
 * @param {number} isActive - Status flag (0 or 1)
 * @returns {Promise<object>} Update result
 */

export const activeupdateOfferStatusById = async (
  isActive,
  offerId,
  userId,
) => {
  const [result] = await pool.query(
    `UPDATE offer_master
     SET is_active=?, updated_by=?
     WHERE offer_id=? AND is_deleted=0`,
    [isActive, userId, offerId],
  );
  return result;
};

/**
 * Fetch all active, non-deleted offers.
 * @returns {Promise<Array>} Offer rows
 */

export const getActiveOffer = async () => {
  const [result] = await pool.query(
    `SELECT * FROM offer_master WHERE is_active=1 AND is_deleted=0`,
  );
  return result;
};

/**
 * Retrieve a currently valid offer by name.
 * Validation in SQL includes:
 * - active + non-deleted status
 * - current date within start/end date window
 * - current time within optional start/end time window
 * @param {string} offerName - Offer name/code entered by client
 * @returns {Promise<Array>} Matching offer rows (max 1 row)
 */
export const getValidateOfferByName = async (offerName) => {
  const [result] = await pool.query(
    `
    SELECT *
    FROM offer_master
    WHERE offer_name = ?
      AND is_active = 1
      AND is_deleted = 0
      AND start_date <= CURDATE()
      AND end_date >= CURDATE()
      AND (
        start_time IS NULL OR end_time IS NULL
        OR (
          CASE 
            WHEN start_time <= end_time THEN
              CURTIME() BETWEEN start_time AND end_time
            WHEN start_time > end_time THEN
              CURTIME() >= start_time OR CURTIME() <= end_time
            ELSE 0
          END
        )
      )
    LIMIT 1
    `,
    [offerName],
  );
  return result;
};

/**
 * Count how many times a user has used a specific offer.
 * @param {number|string} offerId - Offer identifier
 * @param {number|string} userId - User identifier
 * @returns {Promise<number>} Usage count
 */
export const getOfferUsageCount = async (offerId, userId) => {
  const [result] = await pool.query(
    `
    SELECT COUNT(*) AS usage_count
    FROM offer_usage
    WHERE offer_id = ? AND user_id = ?
    `,
    [offerId, userId],
  );

  return result[0].usage_count;
};

/**
 * Check whether an active offer is mapped to the given product/category scope.
 * At least one of productId/categoryId should be provided by caller.
 * @param {number|string} offerId - Offer identifier
 * @param {number|null} productId - Product identifier
 * @param {number|null} categoryId - Category identifier
 * @returns {Promise<boolean>} True when matching active mapping exists
 */
export const isOfferMappedToScope = async (offerId, productId, categoryId) => {
  const [result] = await pool.query(
    `SELECT offer_product_category_id
     FROM offer_product_category
     WHERE offer_id = ?
       AND is_active = 1
       AND is_deleted = 0
       AND (
         (? IS NOT NULL AND product_id = ?)
         OR (? IS NOT NULL AND category_id = ?)
       )
     LIMIT 1`,
    [offerId, productId, productId, categoryId, categoryId],
  );

  return result.length > 0;
};

/**
 * Fetch all usage entries for a specific offer.
 * @param {number|string} offerId - Offer identifier
 * @returns {Promise<Array>} Offer usage rows
 */
export const getOfferUsageByOfferId = async (offerId) => {
  const [result] = await pool.query(
    `SELECT ou.offer_id,
    om.offer_name,
    om.offer_type,
    om.discount_type,
    om.discount_value,
    ou.user_id,
    ou.order_id,
    ou.discount_amount,
    -- ou.usage_count,
    ou.created_at 
    FROM offer_usage AS ou 
    LEFT JOIN offer_master AS om
    ON om.offer_id=ou.offer_id 
    WHERE ou.offer_id=?`,
    [offerId],
  );
  return result;
};
/**
 * Fetch all usage entries for a specific user.
 * @param {number|string} userId - User identifier
 * @returns {Promise<Array>} Offer usage rows
 */
export const getOfferUsageByUserId = async (userId) => {
  const [result] = await pool.query(
    `SELECT ou.offer_id,
    om.offer_name,
    om.offer_type,
    om.discount_type,
    om.discount_value,
    ou.user_id,
    ou.order_id,
    ou.discount_amount,
    -- ou.usage_count,
    ou.created_at 
    FROM offer_usage AS ou 
    LEFT JOIN offer_master AS om
    ON om.offer_id=ou.offer_id
    WHERE ou.user_id=?`,
    [userId],
  );
  return result;
};

/**
 * Fetch offer-level usage analytics summary.
 * Includes each offer with:
 * - total number of usage records
 * - total discount amount granted
 * @returns {Promise<Array>} Usage summary rows ordered by total usage (desc)
 */
export const getAllOfferUsageSummary = async () => {
  const [result] = await pool.query(`SELECT 
      om.offer_id,
      om.offer_name,
      om.offer_type,
      om.discount_type,
      om.discount_value,
      COUNT(ou.offer_usage_id) AS total_usage,
      COALESCE(SUM(ou.discount_amount), 0) AS total_discount_given
    FROM  offer_usage ou
    LEFT JOIN offer_master om
      ON om.offer_id = ou.offer_id
    GROUP BY 
      om.offer_id,
      om.offer_name,
      om.offer_type,
      om.discount_type,
      om.discount_value
    ORDER BY total_usage DESC
    `);

  return result;
};

export const createOfferUsage = async (offerData) => {
  const { offer_id, user_id, order_id, discount_amount } = offerData;

  const [result] = await pool.query(
    `INSERT INTO offer_usage
     (offer_id, user_id, order_id, discount_amount)
     VALUES (?, ?, ?, ?)`,
    [offer_id, user_id, order_id, discount_amount],
  );

  return result;
};

// ============================================================================
// OFFER PRODUCT CATEGORY MAPPING QUERIES
// ============================================================================

/**
 * Check whether an offer exists in offer_master and is not deleted.
 * @param {number|string} offerId - Offer identifier
 * @returns {Promise<boolean>} True when offer exists
 */
export const isOfferExistsById = async (offerId) => {
  const [result] = await pool.query(
    `SELECT offer_id
     FROM offer_master
     WHERE offer_id = ? AND is_deleted = 0
     LIMIT 1`,
    [offerId],
  );

  return result.length > 0;
};

/**
 * Check whether offer-product/category mapping already exists.
 * @param {object} mappingData - Mapping payload
 * @returns {Promise<boolean>} True when mapping exists
 */
export const isOfferProductCategoryMappingExists = async (mappingData) => {
  const { offer_id, product_id, category_id } = mappingData;

  const [result] = await pool.query(
    `SELECT offer_product_category_id
     FROM offer_product_category
     WHERE offer_id = ?
       AND is_deleted = 0
       AND (
         (? IS NOT NULL AND product_id = ?)
         OR (? IS NOT NULL AND category_id = ?)
       )
     LIMIT 1`,
    [offer_id, product_id, product_id, category_id, category_id],
  );

  return result.length > 0;
};

/**
 * Create offer to product/category mapping.
 * @param {object} mappingData - Mapping payload
 * @param {number|string} userId - Authenticated user id
 * @returns {Promise<object>} Insert result
 */
export const createOfferProductCategoryMapping = async (
  mappingData,
  userId,
) => {
  const { offer_id, product_id, category_id } = mappingData;

  const [result] = await pool.query(
    `INSERT INTO offer_product_category
    (offer_id, product_id, category_id, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?)`,
    [offer_id, product_id ?? null, category_id ?? null, userId, userId],
  );

  return result;
};

/**
 * Fetch all non-deleted mappings.
 * @returns {Promise<Array>} Mapping rows
 */
export const getAllOfferProductCategoryMappings = async () => {
  const [result] = await pool.query(
    `SELECT opc.*,
            om.offer_name,
            om.description AS offer_description,
            om.offer_type,
            om.discount_type AS offer_discount_type,
            om.discount_value AS offer_discount_value,
            om.maximum_discount_amount AS offer_maximum_discount_amount,
            om.min_purchase_amount AS offer_min_purchase_amount,
            om.usage_limit_per_user AS offer_usage_limit_per_user,
            om.start_date AS offer_start_date,
            om.end_date AS offer_end_date,
            om.start_time AS offer_start_time,
            om.end_time AS offer_end_time,
            om.is_active AS offer_is_active
     FROM offer_product_category AS opc
     INNER JOIN offer_master AS om
        ON om.offer_id = opc.offer_id
     WHERE opc.is_deleted = 0`,
  );

  return result;
};

/**
 * Fetch all active mappings for a given offer id.
 * @param {number|string} offerId - Offer identifier
 * @returns {Promise<Array>} Mapping rows
 */
export const getOfferProductCategoryMappingsByOfferId = async (offerId) => {
  const [result] = await pool.query(
    `SELECT opc.*,
            om.offer_name,
            om.description AS offer_description,
            om.offer_type,
            om.discount_type AS offer_discount_type,
            om.discount_value AS offer_discount_value,
            om.maximum_discount_amount AS offer_maximum_discount_amount,
            om.min_purchase_amount AS offer_min_purchase_amount,
            om.usage_limit_per_user AS offer_usage_limit_per_user,
            om.start_date AS offer_start_date,
            om.end_date AS offer_end_date,
            om.start_time AS offer_start_time,
            om.end_time AS offer_end_time,
            om.is_active AS offer_is_active
     FROM offer_product_category AS opc
     INNER JOIN offer_master AS om
        ON om.offer_id = opc.offer_id
     WHERE opc.offer_id = ?
       AND opc.is_deleted = 0`,
    [offerId],
  );

  return result;
};

/**
 * Fetch one mapping by mapping id.
 * @param {number|string} mappingId - Mapping identifier
 * @returns {Promise<Array>} Mapping row
 */
export const getOfferProductCategoryMappingById = async (mappingId) => {
  const [result] = await pool.query(
    `SELECT opc.*,
            om.offer_name,
            om.description AS offer_description,
            om.offer_type,
            om.discount_type AS offer_discount_type,
            om.discount_value AS offer_discount_value,
            om.maximum_discount_amount AS offer_maximum_discount_amount,
            om.min_purchase_amount AS offer_min_purchase_amount,
            om.usage_limit_per_user AS offer_usage_limit_per_user,
            om.start_date AS offer_start_date,
            om.end_date AS offer_end_date,
            om.start_time AS offer_start_time,
            om.end_time AS offer_end_time,
            om.is_active AS offer_is_active
     FROM offer_product_category AS opc
     INNER JOIN offer_master AS om
        ON om.offer_id = opc.offer_id
     WHERE opc.offer_product_category_id = ?
       AND opc.is_deleted = 0`,
    [mappingId],
  );

  return result;
};

/**
 * Check duplicate mapping for the same offer and scope while updating.
 * @param {number|string} offerId - Offer identifier
 * @param {number|null} productId - Product identifier
 * @param {number|null} categoryId - Category identifier
 * @param {number|string} excludeMappingId - Mapping id to exclude
 * @returns {Promise<boolean>} True when duplicate exists
 */
export const isOfferProductCategoryDuplicateOnUpdate = async (
  offerId,
  productId,
  categoryId,
  excludeMappingId,
) => {
  const [result] = await pool.query(
    `SELECT offer_product_category_id
     FROM offer_product_category
     WHERE offer_id = ?
       AND offer_product_category_id <> ?
       AND is_deleted = 0
       AND (
         (? IS NOT NULL AND product_id = ?)
         OR (? IS NOT NULL AND category_id = ?)
       )`,
    [offerId, excludeMappingId, productId, productId, categoryId, categoryId],
  );

  return result.length > 0;
};

/**
 * Update mapping by mapping id.
 * Allowed fields: product_id, category_id, is_active
 * @param {number|string} mappingId - Mapping identifier
 * @param {object} updateData - Update payload
 * @param {number|string} userId - Authenticated user id
 * @returns {Promise<object|null>} Update result
 */
export const updateOfferProductCategoryMappingById = async (
  mappingId,
  updateData,
  userId,
) => {
  const allowedFields = ["product_id", "category_id", "is_active"];
  const fields = [];
  const values = [];

  for (const key in updateData) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push("updated_by = ?");
  values.push(userId);
  values.push(mappingId);

  const [result] = await pool.query(
    `UPDATE offer_product_category
     SET ${fields.join(", ")}
     WHERE offer_product_category_id = ?
       AND is_deleted = 0`,
    values,
  );

  return result;
};

/**
 * Soft delete mapping by mapping id.
 * @param {number|string} mappingId - Mapping identifier
 * @param {number|string} userId - Authenticated user id
 * @returns {Promise<object>} Update result
 */
export const deleteOfferProductCategoryMappingById = async (
  mappingId,
  userId,
) => {
  const [result] = await pool.query(
    `UPDATE offer_product_category
     SET is_deleted = 1,
         is_active = 0,
         updated_by = ?
     WHERE offer_product_category_id = ?
       AND is_deleted = 0`,
    [userId, mappingId],
  );

  return result;
};
