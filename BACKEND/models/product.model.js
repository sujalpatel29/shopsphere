import db from "../configs/db.js";

const Product = {

    //  Create Product
  create: (data, conn = db) => {
    const sql = `
      INSERT INTO product_master
      (name, display_name, description, short_description,
       price, discounted_price, stock, category_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return conn.execute(sql, [
      data.name,
      data.display_name,
      data.description,
      data.short_description,
      data.price,
      data.discounted_price,
      data.stock ?? 0,
      data.category_id ?? null,
      data.created_by
    ]);
  },

    //  Fetch Category + Parents
  getCategoryWithParents: (categoryId, conn = db) => {
    const sql = `
      WITH RECURSIVE category_tree AS (
        SELECT category_id, parent_id
        FROM category_master
        WHERE category_id = ?

        UNION ALL

        SELECT c.category_id, c.parent_id
        FROM category_master c
        INNER JOIN category_tree ct
          ON ct.parent_id = c.category_id
      )
      SELECT category_id FROM category_tree
    `;

    return conn.execute(sql, [categoryId]);
  },

  //  Check Category Exists
checkCategoryExists: async (categoryId, conn = db) => {
  const sql = `
    SELECT category_id
    FROM category_master
    WHERE category_id = ?
    LIMIT 1
  `;

  const [rows] = await conn.execute(sql, [categoryId]);
  return rows.length > 0;
},

    //  Insert Product Categories

  insertProductCategories: (productId, categoryIds, conn = db) => {
    if (!categoryIds.length) return;

    const values = categoryIds.map(cid => [productId, cid]);

    const sql = `
      INSERT IGNORE INTO product_categories (product_id, category_id) VALUES ?
    `;

    return conn.query(sql, [values]);
  },

  //  Soft Delete Product
  
  softDelete: (productId, updatedBy, conn = db) => {
    const sql = `
      UPDATE product_master
      SET is_deleted = 1,
          is_active = 0,
          updated_by = ?
      WHERE product_id = ? AND is_deleted = 0
    `;

    return conn.execute(sql, [updatedBy, productId]);
  },

  // find all product with filtering
  findAll: (filters = {}, conn = db) => {
    const conditions = ["p.is_deleted = 0"];
    const values = [];

    let sql = `
      SELECT DISTINCT p.*
      FROM product_master p
    `;

    // category filtering
    if (filters.category_id) {
      sql += `
        INNER JOIN product_categories pc
        ON p.product_id = pc.product_id
      `;
      conditions.push("pc.category_id = ?");
      values.push(filters.category_id);
    }

    // Price filtering
    if (filters.min_price) {
      conditions.push("p.price >= ?");
      values.push(filters.min_price);
    }

    if (filters.max_price) {
      conditions.push("p.price <= ?");
      values.push(filters.max_price);
    }

    // Search by name
    if (filters.search) {
      conditions.push("p.name LIKE ?");
      values.push(`%${filters.search}%`);
    }

    // Status filter
    if (filters.is_active !== undefined) {
      conditions.push("p.is_active = ?");
      values.push(filters.is_active);
    }

    sql += `
      WHERE ${conditions.join(" AND ")}
      ORDER BY p.created_at DESC
    `;

    return conn.execute(sql, values);
  },

  findById: (id) => {
    return db.execute(`
      SELECT *
      FROM product_master
      WHERE product_id = ? AND is_deleted = 0
    `, [id]);
  },

  update: (id, data, conn = db) => {
    const fields = [];
    const values = [];

    for (const key in data) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (!fields.length) return;

    const sql = `
      UPDATE product_master
      SET ${fields.join(", ")}
      WHERE product_id = ? AND is_deleted = 0
    `;

    values.push(id);

    return conn.execute(sql, values);
  },

  updateStatus: (id, is_active, updatedBy, conn = db) => {
    const sql = `
      UPDATE product_masterx
      SET is_active = ?,
          updated_by = ?
      WHERE product_id = ? AND is_deleted = 0
    `;

    return conn.execute(sql, [is_active, updatedBy, id]);
  },

};
export default Product;