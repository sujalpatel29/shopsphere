import pool from "../configs/db.js";

const TARGET_MONTH_COUNT = 8;
const ORDER_PREFIX = "SP-SEED";
const SALE_STATUSES = ["completed", "delivered"];
const TAX_RATE = 0.18;

function monthStartUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function formatMonthKey(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function targetMonths(count) {
  const months = [];
  const now = new Date();
  const currentMonthStart = monthStartUTC(now);

  for (let offset = count; offset >= 1; offset -= 1) {
    months.push(
      new Date(
        Date.UTC(
          currentMonthStart.getUTCFullYear(),
          currentMonthStart.getUTCMonth() - offset,
          1,
        ),
      ),
    );
  }

  return months;
}

function deterministicQuantity(productId, monthDate) {
  const seed =
    productId * 31 +
    (monthDate.getUTCMonth() + 1) * 17 +
    monthDate.getUTCFullYear() * 13;
  return 2 + (Math.abs(seed) % 10);
}

function orderNumber(productId, monthDate) {
  const yyyy = monthDate.getUTCFullYear();
  const mm = String(monthDate.getUTCMonth() + 1).padStart(2, "0");
  return `${ORDER_PREFIX}-${productId}-${yyyy}${mm}`;
}

function orderCreatedAt(productId, monthDate) {
  const day = 5 + (productId % 20); // 5..24 keeps date valid for every month
  return new Date(
    Date.UTC(
      monthDate.getUTCFullYear(),
      monthDate.getUTCMonth(),
      Math.min(day, 28),
      10,
      0,
      0,
    ),
  );
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

async function ensureSalesPredictionTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS sales_predictions (
      prediction_id INT NOT NULL AUTO_INCREMENT,
      product_id INT NOT NULL,
      predicted_month DATE NOT NULL,
      predicted_qty DECIMAL(10,2) NOT NULL,
      predicted_revenue DECIMAL(12,2) NOT NULL,
      confidence_score DECIMAL(5,4) DEFAULT NULL,
      model_used VARCHAR(50) DEFAULT 'prophet',
      generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (prediction_id),
      UNIQUE KEY uq_product_month (product_id, predicted_month),
      KEY idx_sales_predictions_product_id (product_id),
      CONSTRAINT fk_sales_predictions_product
        FOREIGN KEY (product_id) REFERENCES product_master(product_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);
}

async function seedSalesHistory() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await ensureSalesPredictionTable(connection);

    const [products] = await connection.query(
      `
      SELECT
        product_id,
        display_name,
        COALESCE(discounted_price, price) AS effective_price
      FROM product_master
      WHERE is_deleted = 0
        AND is_active = 1
      ORDER BY product_id ASC
      `,
    );

    if (!products.length) {
      throw new Error("No active products found. Seed products before seeding sales history.");
    }

    const [customers] = await connection.query(
      `
      SELECT
        u.user_id,
        (
          SELECT ua.address_id
          FROM user_addresses ua
          WHERE ua.user_id = u.user_id
            AND ua.is_deleted = 0
          ORDER BY ua.is_default DESC, ua.address_id ASC
          LIMIT 1
        ) AS address_id
      FROM user_master u
      WHERE u.is_deleted = 0
        AND u.role = 'customer'
      ORDER BY u.user_id ASC
      `,
    );

    if (!customers.length) {
      throw new Error("No customer users found. Seed at least one customer before running this script.");
    }

    const [adminRows] = await connection.query(
      `
      SELECT user_id
      FROM user_master
      WHERE is_deleted = 0
        AND role = 'admin'
      ORDER BY user_id ASC
      LIMIT 1
      `,
    );
    const adminUserId = adminRows[0]?.user_id ?? customers[0].user_id;

    const productIds = products.map((product) => product.product_id);

    const [monthlyRows] = await connection.query(
      `
      SELECT
        oi.product_id,
        DATE_FORMAT(om.created_at, '%Y-%m-01') AS month_key
      FROM order_items oi
      INNER JOIN order_master om ON om.order_id = oi.order_id
      WHERE oi.is_deleted = 0
        AND om.is_deleted = 0
        AND om.order_status IN (?)
        AND oi.product_id IN (?)
      GROUP BY oi.product_id, month_key
      `,
      [SALE_STATUSES, productIds],
    );

    const monthByProduct = new Map();
    for (const row of monthlyRows) {
      if (!monthByProduct.has(row.product_id)) {
        monthByProduct.set(row.product_id, new Set());
      }
      monthByProduct.get(row.product_id).add(row.month_key);
    }

    let insertedOrders = 0;
    let insertedItems = 0;
    const months = targetMonths(TARGET_MONTH_COUNT);

    for (const product of products) {
      const existingMonths = monthByProduct.get(product.product_id) ?? new Set();

      for (const monthDate of months) {
        const monthKey = formatMonthKey(monthDate);
        if (existingMonths.has(monthKey)) {
          continue;
        }

        const customerIndex =
          (product.product_id + monthDate.getUTCMonth()) % customers.length;
        const customer = customers[customerIndex];

        const qty = deterministicQuantity(product.product_id, monthDate);
        const price = Number(product.effective_price || 0);
        const subtotal = round2(price * qty);
        const taxAmount = round2(subtotal * TAX_RATE);
        const lineTotal = round2(subtotal + taxAmount);
        const createdAt = orderCreatedAt(product.product_id, monthDate);
        const seedOrderNumber = orderNumber(product.product_id, monthDate);

        const [orderExistsRows] = await connection.query(
          `
          SELECT order_id
          FROM order_master
          WHERE order_number = ?
          LIMIT 1
          `,
          [seedOrderNumber],
        );

        if (orderExistsRows.length) {
          existingMonths.add(monthKey);
          continue;
        }

        const [orderResult] = await connection.query(
          `
          INSERT INTO order_master
            (
              order_number,
              user_id,
              address_id,
              subtotal,
              tax_amount,
              shipping_amount,
              discount_amount,
              total_amount,
              order_status,
              payment_status,
              created_by,
              updated_by,
              created_at
            )
          VALUES (?, ?, ?, ?, ?, 0, 0, ?, 'completed', 'completed', ?, ?, ?)
          `,
          [
            seedOrderNumber,
            customer.user_id,
            customer.address_id ?? null,
            subtotal,
            taxAmount,
            lineTotal,
            adminUserId,
            adminUserId,
            createdAt,
          ],
        );

        await connection.query(
          `
          INSERT INTO order_items
            (
              order_id,
              product_id,
              product_portion_id,
              modifier_id,
              product_name,
              portion_value,
              modifier_value,
              quantity,
              price,
              discount,
              tax,
              total,
              created_by,
              updated_by,
              created_at
            )
          VALUES (?, ?, NULL, NULL, ?, NULL, NULL, ?, ?, 0, ?, ?, ?, ?, ?)
          `,
          [
            orderResult.insertId,
            product.product_id,
            product.display_name,
            qty,
            price,
            taxAmount,
            lineTotal,
            adminUserId,
            adminUserId,
            createdAt,
          ],
        );

        insertedOrders += 1;
        insertedItems += 1;
        existingMonths.add(monthKey);
      }
    }

    await connection.commit();

    console.log("Sales history seed completed.");
    console.log(`Inserted orders: ${insertedOrders}`);
    console.log(`Inserted order_items: ${insertedItems}`);
  } catch (error) {
    await connection.rollback();
    console.error("Sales history seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seedSalesHistory();
