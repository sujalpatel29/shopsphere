import pool from "../configs/db.js";

/**
 * Seed script: Creates 60+ completed/delivered orders spread across 8 months
 * for ALL active products, plus 8 diverse offers for testing.
 *
 * Run: node scripts/seed_orders_and_offers.js
 */

const TAX_RATE = 0.18;
const ORDER_PREFIX = "SP-EXTRA";
const TARGET_ORDERS = 60;

function round2(v) {
  return Math.round(Number(v) * 100) / 100;
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedOrdersAndOffers() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ── Fetch active products ──────────────────────────────────────
    const [products] = await connection.query(
      `SELECT product_id, display_name, COALESCE(discounted_price, price) AS effective_price
       FROM product_master WHERE is_deleted = 0 AND is_active = 1 ORDER BY product_id`,
    );
    if (!products.length) throw new Error("No active products found.");
    console.log(`Found ${products.length} active products`);

    // ── Fetch customers with addresses ─────────────────────────────
    const [customers] = await connection.query(
      `SELECT u.user_id,
              (SELECT ua.address_id FROM user_addresses ua
               WHERE ua.user_id = u.user_id AND ua.is_deleted = 0
               ORDER BY ua.is_default DESC, ua.address_id ASC LIMIT 1) AS address_id
       FROM user_master u WHERE u.is_deleted = 0 AND u.role = 'customer' ORDER BY u.user_id`,
    );
    if (!customers.length) throw new Error("No customers found.");

    // ── Fetch admin ────────────────────────────────────────────────
    const [adminRows] = await connection.query(
      `SELECT user_id FROM user_master WHERE is_deleted = 0 AND role = 'admin' ORDER BY user_id LIMIT 1`,
    );
    const adminId = adminRows[0]?.user_id ?? customers[0].user_id;

    // ── Check existing seed orders to avoid duplicates ─────────────
    const [existingOrders] = await connection.query(
      `SELECT order_number FROM order_master WHERE order_number LIKE '${ORDER_PREFIX}%'`,
    );
    const existingSet = new Set(existingOrders.map((r) => r.order_number));

    // ── Generate months: 8 months back from current month ──────────
    const now = new Date();
    const months = [];
    for (let offset = 8; offset >= 1; offset--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
      months.push(d);
    }

    // ── Create orders ──────────────────────────────────────────────
    // Strategy: spread TARGET_ORDERS across months, each order has 1-3 items
    // from random products. All orders are completed or delivered.
    let insertedOrders = 0;
    let insertedItems = 0;
    const statuses = ["completed", "delivered"];

    // Ensure every product gets at least one order across the months
    // First pass: one order per product (spread across months)
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const monthDate = months[i % months.length];
      const orderNum = `${ORDER_PREFIX}-P${product.product_id}-${monthDate.getUTCFullYear()}${String(monthDate.getUTCMonth() + 1).padStart(2, "0")}`;

      if (existingSet.has(orderNum)) continue;

      const customer = customers[i % customers.length];
      const qty = randomInt(1, 5);
      const price = Number(product.effective_price || 500);
      const subtotal = round2(price * qty);
      const tax = round2(subtotal * TAX_RATE);
      const total = round2(subtotal + tax);
      const day = Math.min(5 + (product.product_id % 23), 28);
      const createdAt = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), day, 10, 0, 0));
      const status = randomElement(statuses);

      const [orderResult] = await connection.query(
        `INSERT INTO order_master
          (order_number, user_id, address_id, subtotal, tax_amount, shipping_amount,
           discount_amount, total_amount, order_status, payment_status,
           created_by, updated_by, created_at)
         VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, 'completed', ?, ?, ?)`,
        [orderNum, customer.user_id, customer.address_id, subtotal, tax, total, status, adminId, adminId, createdAt],
      );

      await connection.query(
        `INSERT INTO order_items
          (order_id, product_id, product_name, quantity, price, discount, tax, total,
           created_by, updated_by, created_at)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
        [orderResult.insertId, product.product_id, product.display_name, qty, price, tax, total, adminId, adminId, createdAt],
      );

      insertedOrders++;
      insertedItems++;
      existingSet.add(orderNum);
    }

    // Second pass: fill up to TARGET_ORDERS with multi-item orders
    let extraIdx = 0;
    while (insertedOrders < TARGET_ORDERS) {
      const monthDate = months[extraIdx % months.length];
      const customer = customers[extraIdx % customers.length];
      const numItems = randomInt(1, 3);
      const day = randomInt(1, 28);
      const hour = randomInt(8, 22);
      const createdAt = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), day, hour, 0, 0));
      const orderNum = `${ORDER_PREFIX}-M${extraIdx}-${monthDate.getUTCFullYear()}${String(monthDate.getUTCMonth() + 1).padStart(2, "0")}`;

      if (existingSet.has(orderNum)) {
        extraIdx++;
        continue;
      }

      let orderSubtotal = 0;
      let orderTax = 0;
      const itemsToInsert = [];

      for (let j = 0; j < numItems; j++) {
        const product = randomElement(products);
        const qty = randomInt(1, 4);
        const price = Number(product.effective_price || 500);
        const itemSubtotal = round2(price * qty);
        const itemTax = round2(itemSubtotal * TAX_RATE);
        const itemTotal = round2(itemSubtotal + itemTax);
        orderSubtotal += itemSubtotal;
        orderTax += itemTax;

        itemsToInsert.push({
          productId: product.product_id,
          productName: product.display_name,
          qty,
          price,
          tax: itemTax,
          total: itemTotal,
        });
      }

      const orderTotal = round2(orderSubtotal + orderTax);
      const status = randomElement(statuses);

      const [orderResult] = await connection.query(
        `INSERT INTO order_master
          (order_number, user_id, address_id, subtotal, tax_amount, shipping_amount,
           discount_amount, total_amount, order_status, payment_status,
           created_by, updated_by, created_at)
         VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, 'completed', ?, ?, ?)`,
        [orderNum, customer.user_id, customer.address_id, round2(orderSubtotal), round2(orderTax), orderTotal, status, adminId, adminId, createdAt],
      );

      for (const item of itemsToInsert) {
        await connection.query(
          `INSERT INTO order_items
            (order_id, product_id, product_name, quantity, price, discount, tax, total,
             created_by, updated_by, created_at)
           VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
          [orderResult.insertId, item.productId, item.productName, item.qty, item.price, item.tax, item.total, adminId, adminId, createdAt],
        );
        insertedItems++;
      }

      insertedOrders++;
      existingSet.add(orderNum);
      extraIdx++;
    }

    console.log(`Inserted ${insertedOrders} orders with ${insertedItems} order items`);

    // ── Seed Offers ────────────────────────────────────────────────
    const offerStartDate = new Date();
    offerStartDate.setMonth(offerStartDate.getMonth() - 1);

    const offerEndDate = new Date();
    offerEndDate.setMonth(offerEndDate.getMonth() + 3);

    const formatDate = (d) => d.toISOString().slice(0, 19).replace("T", " ");

    const offers = [
      {
        offer_name: "WELCOME10",
        description: "10% off on your first order! Welcome to ShopSphere.",
        offer_type: "first_order",
        discount_type: "percentage",
        discount_value: 10,
        maximum_discount_amount: 500,
        min_purchase_amount: 200,
        usage_limit_per_user: 1,
      },
      {
        offer_name: "FLAT200",
        description: "Flat ₹200 off on orders above ₹1500.",
        offer_type: "flat_discount",
        discount_type: "fixed_amount",
        discount_value: 200,
        maximum_discount_amount: 200,
        min_purchase_amount: 1500,
        usage_limit_per_user: 3,
      },
      {
        offer_name: "SAVE15",
        description: "Save 15% up to ₹750 on all purchases.",
        offer_type: "flat_discount",
        discount_type: "percentage",
        discount_value: 15,
        maximum_discount_amount: 750,
        min_purchase_amount: 500,
        usage_limit_per_user: 2,
      },
      {
        offer_name: "MEGA25",
        description: "Mega sale! 25% off up to ₹1000.",
        offer_type: "time_based",
        discount_type: "percentage",
        discount_value: 25,
        maximum_discount_amount: 1000,
        min_purchase_amount: 1000,
        usage_limit_per_user: 1,
      },
      {
        offer_name: "FLAT500",
        description: "Flat ₹500 off on orders above ₹3000.",
        offer_type: "flat_discount",
        discount_type: "fixed_amount",
        discount_value: 500,
        maximum_discount_amount: 500,
        min_purchase_amount: 3000,
        usage_limit_per_user: 2,
      },
      {
        offer_name: "NEWUSER20",
        description: "20% off for new users, up to ₹600.",
        offer_type: "first_order",
        discount_type: "percentage",
        discount_value: 20,
        maximum_discount_amount: 600,
        min_purchase_amount: 300,
        usage_limit_per_user: 1,
      },
      {
        offer_name: "FLASHSALE",
        description: "Limited-time flash sale! 30% off up to ₹1200.",
        offer_type: "time_based",
        discount_type: "percentage",
        discount_value: 30,
        maximum_discount_amount: 1200,
        min_purchase_amount: 2000,
        usage_limit_per_user: 1,
      },
      {
        offer_name: "FLAT100",
        description: "₹100 off on any order above ₹500. No restrictions!",
        offer_type: "flat_discount",
        discount_type: "fixed_amount",
        discount_value: 100,
        maximum_discount_amount: 100,
        min_purchase_amount: 500,
        usage_limit_per_user: 5,
      },
    ];

    let insertedOffers = 0;
    for (const offer of offers) {
      // Skip if offer with same name already exists
      const [existing] = await connection.query(
        `SELECT offer_id FROM offer_master WHERE offer_name = ? AND is_deleted = 0`,
        [offer.offer_name],
      );
      if (existing.length) {
        console.log(`  Offer "${offer.offer_name}" already exists, skipping.`);
        continue;
      }

      await connection.query(
        `INSERT INTO offer_master
          (offer_name, description, offer_type, discount_type, discount_value,
           maximum_discount_amount, min_purchase_amount, usage_limit_per_user,
           start_date, end_date, start_time, end_time,
           is_active, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, 1, ?, ?)`,
        [
          offer.offer_name,
          offer.description,
          offer.offer_type,
          offer.discount_type,
          offer.discount_value,
          offer.maximum_discount_amount,
          offer.min_purchase_amount,
          offer.usage_limit_per_user,
          formatDate(offerStartDate),
          formatDate(offerEndDate),
          adminId,
          adminId,
        ],
      );
      insertedOffers++;
    }

    console.log(`Inserted ${insertedOffers} offers`);

    await connection.commit();
    console.log("\n✅ Seed completed successfully!");
    console.log(`  Orders: ${insertedOrders}`);
    console.log(`  Order items: ${insertedItems}`);
    console.log(`  Offers: ${insertedOffers}`);
    console.log("\nNow re-run the sales history seed and then predict-all:");
    console.log("  npm run seed:sales-history");
    console.log("  Then hit GET /predict-all on the prediction service");
  } catch (error) {
    await connection.rollback();
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seedOrdersAndOffers();
