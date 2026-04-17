import pool from "../configs/db.js";

const predQuery = `
  SELECT
    DATE(DATE_SUB(om.created_at, INTERVAL DAY(om.created_at) - 1 DAY)) AS month,
    ROUND(SUM(oi.quantity), 2) AS qty,
    ROUND(SUM(oi.total), 2)    AS revenue
  FROM order_items oi
  INNER JOIN order_master om ON om.order_id = oi.order_id
  WHERE oi.product_id = ?
    AND oi.is_deleted = 0
    AND om.is_deleted = 0
    AND om.order_status IN ('completed','delivered')
  GROUP BY month
  ORDER BY month ASC
`;

async function main() {
  console.log("--- Order header total integrity ---");
  const [h] = await pool.query(`
    SELECT order_id, order_number, total_amount,
           ROUND(subtotal + tax_amount + shipping_amount - discount_amount, 2) AS computed
      FROM order_master
     HAVING total_amount <> computed
     LIMIT 5
  `);
  console.log("Mismatches (header):", h.length);
  if (h.length) console.table(h);

  console.log("\n--- Items vs header integrity (sub + tax) ---");
  const [li] = await pool.query(`
    SELECT om.order_id, om.order_number,
           om.subtotal AS header_sub,
           ROUND(SUM(oi.price * oi.quantity), 2) AS items_sub,
           om.tax_amount AS header_tax,
           ROUND(SUM(oi.tax), 2) AS items_tax
      FROM order_master om
      JOIN order_items oi ON oi.order_id = om.order_id
     GROUP BY om.order_id
    HAVING header_sub <> items_sub OR ABS(items_tax - header_tax) > 0.05
     LIMIT 5
  `);
  console.log("Mismatches (items):", li.length);
  if (li.length) console.table(li);

  console.log("\n--- Per-product monthly sales coverage ---");
  const [cov] = await pool.query(`
    SELECT pm.product_id, pm.display_name,
           COUNT(DISTINCT DATE_FORMAT(om.created_at, '%Y-%m')) AS months,
           COALESCE(SUM(oi.quantity), 0) AS total_qty,
           COUNT(oi.order_item_id) AS line_items
      FROM product_master pm
      LEFT JOIN order_items oi
             ON oi.product_id = pm.product_id AND oi.is_deleted = 0
      LEFT JOIN order_master om
             ON om.order_id = oi.order_id
            AND om.is_deleted = 0
            AND om.order_status IN ('completed','delivered')
     GROUP BY pm.product_id
     ORDER BY months DESC, pm.product_id
  `);
  console.table(cov);

  console.log("\n--- Prediction query (product_id=1 — iPhone 15 Pro Max, expected 8 months) ---");
  const [p1] = await pool.query(predQuery, [1]);
  console.table(p1);

  console.log("\n--- Prediction query (product_id=10 — The Ordinary, expected 4 months) ---");
  const [p10] = await pool.query(predQuery, [10]);
  console.table(p10);

  console.log("\n--- Offer usage breakdown ---");
  const [off] = await pool.query(`
    SELECT o.offer_name, o.offer_type, COUNT(u.offer_usage_id) AS uses, ROUND(SUM(u.discount_amount), 2) AS total_discount
      FROM offer_master o
      LEFT JOIN offer_usage u ON u.offer_id = o.offer_id
     GROUP BY o.offer_id
     ORDER BY uses DESC
  `);
  console.table(off);

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
