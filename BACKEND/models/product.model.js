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
      data.created_by,
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

  insertProductCategories: (productId, categoryIds, user_id, conn = db) => {
    if (!categoryIds.length) return;

    const values = categoryIds.map((cid) => [productId, cid, user_id]);

    const sql = `
      INSERT IGNORE INTO product_categories (product_id, category_id, created_by) VALUES ?
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
  findAll: async (filters = {}, pagination = {}, conn = db) => {
    // Unfiltered stats — always reflect entire catalog
    const [statsRows] = await conn.execute(`
      SELECT
        COUNT(*) AS totalAll,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS totalActive
      FROM product_master
      WHERE is_deleted = 0
    `);
    const { totalAll, totalActive } = statsRows[0];

    const conditions = ["p.is_deleted = 0"];
    const values = [];

    let baseSql = `
      FROM product_master p
      LEFT JOIN category_master c ON p.category_id = c.category_id
      LEFT JOIN product_images pi ON pi.product_id = p.product_id AND pi.is_primary = 1 AND pi.image_level = 'PRODUCT' AND pi.is_deleted = 0
      LEFT JOIN (
        SELECT pp.product_id,
               COUNT(*) AS portion_count,
               GROUP_CONCAT(po.portion_value ORDER BY po.portion_value SEPARATOR ', ') AS portion_values,
               GROUP_CONCAT(
                 CONCAT(pp.product_portion_id, '@@', po.portion_value, '||', pp.price, '||', COALESCE(pp.discounted_price, ''), '||', pp.stock)
                 ORDER BY po.portion_value SEPARATOR ';;'
               ) AS portion_details
        FROM product_portion pp
        JOIN portion_master po ON po.portion_id = pp.portion_id
        WHERE pp.is_deleted = 0
        GROUP BY pp.product_id
      ) ptc ON p.product_id = ptc.product_id
      LEFT JOIN (
        SELECT pp2.product_id,
               COUNT(DISTINCT mp.modifier_id) AS modifier_count,
               GROUP_CONCAT(DISTINCT CONCAT(mm.modifier_name, ': ', mm.modifier_value) ORDER BY mm.modifier_name SEPARATOR ', ') AS modifier_values,
               GROUP_CONCAT(
                 CONCAT(pp2.product_portion_id, '@@', mm.modifier_name, ': ', mm.modifier_value, '||', COALESCE(mp.additional_price, 0), '||', mp.stock)
                 ORDER BY pp2.product_portion_id, mm.modifier_name SEPARATOR ';;'
               ) AS modifier_details
        FROM product_portion pp2
        JOIN modifier_portion mp ON mp.product_portion_id = pp2.product_portion_id AND mp.is_deleted = 0
        JOIN modifier_master mm ON mm.modifier_id = mp.modifier_id AND mm.is_deleted = 0
        WHERE pp2.is_deleted = 0
        GROUP BY pp2.product_id
      ) mc ON p.product_id = mc.product_id
    `;

    // category filtering
    if (filters.category_id) {
      baseSql += `
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

    // Search by name or display name
    if (filters.search) {
      const normalizedSearch = String(filters.search)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "");

      conditions.push(`(
        LOWER(REPLACE(COALESCE(p.name, ''), ' ', '')) LIKE ?
        OR LOWER(REPLACE(COALESCE(p.display_name, ''), ' ', '')) LIKE ?
        OR LOWER(REPLACE(COALESCE(p.description, ''), ' ', '')) LIKE ?
      )`);
      values.push(`%${normalizedSearch}%`);
      values.push(`%${normalizedSearch}%`);
      values.push(`%${normalizedSearch}%`);
    }

    // Status filter
    if (filters.is_active !== undefined) {
      conditions.push("p.is_active = ?");
      values.push(filters.is_active);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`; //ORDER BY p.created_at DESC

    const countSql = `
      SELECT COUNT(DISTINCT p.product_id) as total
      ${baseSql}
      ${whereClause}
    `;

    const [countRows] = await conn.execute(countSql, values);
    const total = countRows[0].total;

    // Pagination values
    const limit = Number(pagination.limit);
    const offset = Number(pagination.offset);

    // Sorting — whitelist allowed columns to prevent SQL injection
    const sortableColumns = {
      product_id: "p.product_id",
      display_name: "p.display_name",
      category_name: "c.category_name",
      price: "p.price",
      stock: "p.stock",
      is_active: "p.is_active",
    };

    let orderClause = "ORDER BY p.product_id ASC";
    if (pagination.sortField && sortableColumns[pagination.sortField]) {
      const dir = pagination.sortOrder === "desc" ? "DESC" : "ASC";
      orderClause = `ORDER BY ${sortableColumns[pagination.sortField]} ${dir}`;
    }

    const dataSql = `
      SELECT DISTINCT p.*, c.category_name, pi.image_url,
             COALESCE(ptc.portion_count, 0) AS portion_count,
             ptc.portion_values,
             ptc.portion_details,
             COALESCE(mc.modifier_count, 0) AS modifier_count,
             mc.modifier_values,
             mc.modifier_details
      ${baseSql}
      ${whereClause}
      ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [dataRows] = await conn.execute(
      dataSql,
      values
    );

    return { total, data: dataRows, totalAll, totalActive };
  },

  findById: (id) => {
    return db.execute(
      `
      SELECT *
      FROM product_master
      WHERE product_id = ? AND is_deleted = 0
    `,
      [id],
    );
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
      UPDATE product_master
      SET is_active = ?,
          updated_by = ?
      WHERE product_id = ? AND is_deleted = 0
    `;

    return conn.execute(sql, [is_active, updatedBy, id]);
  },
};
export default Product;
