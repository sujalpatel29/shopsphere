/**
 * seed-comprehensive.js — Production-grade demo seeder for ShopSphere.
 *
 *  - Wipes all data tables (preserves user_id=1 admin + app_settings).
 *  - Inserts 6 sellers, 15 customers, 6-root category tree with subs,
 *    35 products (12 rich + 23 minimal), 6 offers across every
 *    offer_type, heavy historical order data for the 12 rich products
 *    (9 × 8mo + 3 × 4–5mo; 5–15 orders/month w/ natural noise + spikes),
 *    matching payments, reviews + helpful votes, offer_usage, activity logs.
 *  - order_number format: ORD-XXXXXX (random 6-digit, UNIQUE-safe).
 *  - All totals mathematically consistent (subtotal + tax + shipping
 *    - discount = total; per line: qty*price + tax - discount = line total).
 *
 *  Static catalogue lives in seed-data.js.
 *  Run: npm run seed
 */

import bcrypt from "bcryptjs";
import pool from "../configs/db.js";
import {
  SELLERS, CUSTOMERS, CATEGORY_TREE, SELLER_BY_ROOT, PRODUCTS, OFFERS,
  REVIEW_POS_TITLES, REVIEW_MIXED_TITLES, REVIEW_NEG_TITLES,
  REVIEW_POS_BODIES, REVIEW_MIXED_BODIES, REVIEW_NEG_BODIES,
  ACTIVITY_ACTIONS, PAYMENT_METHODS_ONLINE, PAYMENT_METHODS_ALL,
} from "./seed-data.js";

const ADMIN_EMAIL = "admin@shopsphere.test";
const ADMIN_PASSWORD = "Admin@123";
const SELLER_PASSWORD = "Seller@123";
const CUSTOMER_PASSWORD = "Customer@123";

// ---------- RNG (seeded so catalogue shape is reproducible) ----------
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260417);
const randInt = (min, max) => Math.floor(rnd() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const round2 = (n) => Math.round(Number(n) * 100) / 100;
const slugify = (s) =>
  String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// ---------- Time helpers ----------
const monthStartUTC = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
function pastMonths(months) {
  const thisMonth = monthStartUTC(new Date());
  const out = [];
  for (let i = months; i >= 1; i -= 1) {
    out.push(new Date(Date.UTC(thisMonth.getUTCFullYear(), thisMonth.getUTCMonth() - i, 1)));
  }
  return out;
}
const daysInMonth = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
function randomTimestampInMonth(m) {
  return new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), randInt(1, daysInMonth(m)), randInt(8, 22), randInt(0, 59), randInt(0, 59)));
}
function mysqlDT(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

async function genOrderNumber(conn, seen) {
  for (let i = 0; i < 50; i += 1) {
    const n = `ORD-${String(randInt(100000, 999999))}`;
    if (seen.has(n)) continue;
    const [rows] = await conn.query("SELECT 1 FROM order_master WHERE order_number = ? LIMIT 1", [n]);
    if (!rows.length) { seen.add(n); return n; }
  }
  throw new Error("Unable to generate unique order_number after 50 attempts");
}

// ---------- Cleanup ----------
async function cleanSlate(conn) {
  const tables = [
    "activity_logs", "review_helpful", "product_reviews",
    "offer_usage", "offer_product_category",
    "payment_master",
    "order_item_modifiers", "order_items", "order_master",
    "cart_item_modifiers", "cart_items", "cart_master",
    "product_images",
    "modifier_combination_items", "modifier_combination",
    "modifier_portion", "product_portion", "product_categories",
    "product_master",
    "offer_master",
    "user_addresses", "seller_profiles",
    "category_master", "modifier_master", "portion_master",
  ];
  await conn.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const t of tables) {
    try { await conn.query("TRUNCATE TABLE ??", [t]); }
    catch (e) { if (e.errno !== 1146) { try { await conn.query("DELETE FROM ??", [t]); } catch {} } }
  }
  await conn.query("DELETE FROM user_master WHERE user_id <> 1");
  await conn.query("ALTER TABLE user_master AUTO_INCREMENT = 2");
  await conn.query("SET FOREIGN_KEY_CHECKS = 1");
}

async function ensureAdmin(conn) {
  const [rows] = await conn.query("SELECT user_id FROM user_master WHERE email = ? LIMIT 1", [ADMIN_EMAIL]);
  if (rows.length) return rows[0].user_id;
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const [res] = await conn.query(
    "INSERT INTO user_master (name, email, password, role) VALUES (?, ?, ?, 'admin')",
    ["Platform Admin", ADMIN_EMAIL, hash],
  );
  return res.insertId;
}

// ---------- Inserts ----------
async function insertSellers(conn, adminId) {
  const hash = await bcrypt.hash(SELLER_PASSWORD, 10);
  const map = {};
  for (const s of SELLERS) {
    const [u] = await conn.query(
      "INSERT INTO user_master (name, email, password, role, is_seller, seller_status, created_by, updated_by) VALUES (?, ?, ?, 'seller', 1, 'approved', ?, ?)",
      [s.name, s.email, hash, adminId, adminId],
    );
    const uid = u.insertId;
    const [p] = await conn.query(
      `INSERT INTO seller_profiles (seller_id, business_name, business_description, business_address, phone, gst_number,
        bank_account_number, bank_ifsc_code, bank_account_holder, verification_status, verified_by, verified_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, NOW())`,
      [uid, s.business_name, s.business_description, s.business_address, s.phone, s.gst_number,
       s.bank_account_number, s.bank_ifsc_code, s.bank_account_holder, adminId],
    );
    await conn.query(
      `INSERT INTO user_addresses (user_id, address_type, full_name, phone, address_line1, city, state, postal_code, country, is_default, created_by, updated_by)
       VALUES (?, 'billing', ?, ?, ?, 'Mumbai', 'Maharashtra', '400050', 'India', 1, ?, ?)`,
      [uid, s.name, s.phone, s.business_address, adminId, adminId],
    );
    map[s.key] = { user_id: uid, seller_profile_id: p.insertId };
  }
  return map;
}

async function insertCustomers(conn, adminId) {
  const hash = await bcrypt.hash(CUSTOMER_PASSWORD, 10);
  const userMap = {};
  const addressMap = {};
  for (const c of CUSTOMERS) {
    const [u] = await conn.query(
      "INSERT INTO user_master (name, email, password, role, created_by, updated_by) VALUES (?, ?, ?, 'customer', ?, ?)",
      [c.name, c.email, hash, adminId, adminId],
    );
    const uid = u.insertId;
    userMap[c.email] = uid;
    const [a] = await conn.query(
      `INSERT INTO user_addresses (user_id, address_type, full_name, phone, address_line1, city, state, postal_code, country, is_default, created_by, updated_by)
       VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, 'India', 1, ?, ?)`,
      [uid, c.name, c.phone, c.address_line1, c.city, c.state, c.postal_code, adminId, adminId],
    );
    addressMap[uid] = a.insertId;
  }
  return { userMap, addressMap };
}

async function insertCategories(conn, adminId) {
  const map = {};
  for (const root of CATEGORY_TREE) {
    const [r] = await conn.query(
      "INSERT INTO category_master (category_name, parent_id, tax_percent, created_by, updated_by) VALUES (?, NULL, ?, ?, ?)",
      [root.name, root.tax_percent, adminId, adminId],
    );
    map[root.key] = { id: r.insertId, tax_percent: Number(root.tax_percent), root_key: root.key };
    for (const child of root.children) {
      const [c] = await conn.query(
        "INSERT INTO category_master (category_name, parent_id, tax_percent, created_by, updated_by) VALUES (?, ?, 0, ?, ?)",
        [child.name, r.insertId, adminId, adminId],
      );
      map[child.key] = { id: c.insertId, tax_percent: Number(root.tax_percent), root_key: root.key };
    }
  }
  return map;
}

async function insertPortions(conn, adminId) {
  const values = new Set();
  for (const p of PRODUCTS) if (p.rich) for (const po of p.portions) values.add(po.v);
  const map = {};
  for (const v of values) {
    const [r] = await conn.query(
      "INSERT INTO portion_master (portion_value, description, is_active, created_by, updated_by) VALUES (?, ?, 1, ?, ?)",
      [v, `Variant: ${v}`, adminId, adminId],
    );
    map[v] = r.insertId;
  }
  return map;
}

async function insertModifiers(conn, adminId) {
  const seen = new Map();
  for (const p of PRODUCTS) if (p.rich) for (const m of p.modifiers) {
    const k = `${m.name}|${m.value}`;
    if (!seen.has(k)) seen.set(k, m);
  }
  const map = {};
  for (const [k, m] of seen) {
    const [r] = await conn.query(
      "INSERT INTO modifier_master (modifier_name, modifier_value, modifier_type, additional_price, is_active, created_by, updated_by) VALUES (?, ?, ?, 0, 1, ?, ?)",
      [m.name, m.value, m.type ?? null, adminId, adminId],
    );
    map[k] = r.insertId;
  }
  return map;
}

async function insertProducts(conn, categoryMap, sellerMap, adminId) {
  const out = [];
  for (const p of PRODUCTS) {
    const cat = categoryMap[p.leaf];
    const sellerId = sellerMap[SELLER_BY_ROOT[cat.root_key]].user_id;
    const slug = slugify(p.display_name);
    const [r] = await conn.query(
      `INSERT INTO product_master (name, display_name, description, short_description, price, discounted_price, stock,
         category_id, seller_id, is_active, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [slug, p.display_name, p.description, p.short, p.price, p.discounted_price ?? null, p.stock,
       cat.id, sellerId, adminId, adminId],
    );
    const pid = r.insertId;
    await conn.query(
      "INSERT INTO product_categories (product_id, category_id, created_by, updated_by) VALUES (?, ?, ?, ?)",
      [pid, cat.id, adminId, adminId],
    );
    // Primary image
    await conn.query(
      `INSERT INTO product_images (product_id, image_level, image_url, public_id, is_primary, created_by, updated_by)
       VALUES (?, 'PRODUCT', ?, ?, 1, ?, ?)`,
      [pid, `https://picsum.photos/seed/shopsphere-${slug}/800/800`, `seed-demo/${slug}-01`, adminId, adminId],
    );
    // Gallery for rich
    if (p.rich) {
      const n = randInt(2, 4);
      for (let g = 2; g <= n + 1; g += 1) {
        await conn.query(
          `INSERT INTO product_images (product_id, image_level, image_url, public_id, is_primary, created_by, updated_by)
           VALUES (?, 'PRODUCT', ?, ?, 0, ?, ?)`,
          [pid, `https://picsum.photos/seed/shopsphere-${slug}-${g}/800/800`, `seed-demo/${slug}-${String(g).padStart(2, "0")}`, adminId, adminId],
        );
      }
    }
    out.push({
      id: pid, slug, display_name: p.display_name,
      price: Number(p.price),
      effective_price: Number(p.discounted_price ?? p.price),
      tax_percent: cat.tax_percent, category_id: cat.id, root_key: cat.root_key, seller_id: sellerId,
      rich: p.rich, history_months: p.history_months,
      portions: p.portions ?? [], modifiers: p.modifiers ?? [],
    });
  }
  return out;
}

async function insertProductPortionsAndModifiers(conn, products, portionMap, modifierMap, adminId) {
  for (const p of products) {
    if (!p.rich) continue;
    for (const po of p.portions) {
      const basePrice = p.effective_price + Number(po.delta ?? 0);
      await conn.query(
        `INSERT INTO product_portion (product_id, portion_id, price, stock, is_active, created_by, updated_by)
         VALUES (?, ?, ?, ?, 1, ?, ?)`,
        [p.id, portionMap[po.v], basePrice, randInt(8, 40), adminId, adminId],
      );
    }
    for (const m of p.modifiers) {
      await conn.query(
        `INSERT INTO modifier_portion (modifier_id, product_portion_id, product_id, additional_price, stock, is_active, created_by, updated_by)
         VALUES (?, NULL, ?, 0, ?, 1, ?, ?)`,
        [modifierMap[`${m.name}|${m.value}`], p.id, randInt(5, 20), adminId, adminId],
      );
    }
  }
}

async function insertOffers(conn, products, categoryMap, adminId) {
  const now = new Date();
  const out = [];
  for (const o of OFFERS) {
    const start = new Date(now.getTime() + o.daysOffsetStart * 86400000);
    const end = new Date(now.getTime() + o.daysOffsetEnd * 86400000);
    const [r] = await conn.query(
      `INSERT INTO offer_master (offer_name, description, offer_type, discount_type, discount_value,
         maximum_discount_amount, min_purchase_amount, usage_limit_per_user, start_date, end_date,
         is_active, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [o.offer_name, o.description, o.offer_type, o.discount_type, o.discount_value,
       o.maximum_discount_amount, o.min_purchase_amount, o.usage_limit_per_user,
       mysqlDT(start), mysqlDT(end), adminId, adminId],
    );
    const oid = r.insertId;
    let resolvedProductId = null;
    let resolvedCategoryKey = null;
    if (o.target.kind === "category") {
      const cat = categoryMap[o.target.categoryKey];
      await conn.query(
        "INSERT INTO offer_product_category (offer_id, product_id, category_id, is_active, created_by, updated_by) VALUES (?, NULL, ?, 1, ?, ?)",
        [oid, cat.id, adminId, adminId],
      );
      resolvedCategoryKey = o.target.categoryKey;
    } else if (o.target.kind === "product") {
      const p = products.find((x) => x.slug === o.target.productSlug);
      if (p) {
        await conn.query(
          "INSERT INTO offer_product_category (offer_id, product_id, category_id, is_active, created_by, updated_by) VALUES (?, ?, NULL, 1, ?, ?)",
          [oid, p.id, adminId, adminId],
        );
        resolvedProductId = p.id;
      }
    }
    out.push({ id: oid, ...o, resolvedProductId, resolvedCategoryKey });
  }
  return out;
}

// ---------- Orders ----------
function monthlyVolume() {
  const r = rnd();
  if (r < 0.15) return randInt(3, 5);       // slow week
  if (r < 0.40) return randInt(12, 15);     // spike
  return randInt(6, 10);                    // normal
}

function computeDiscountForOrder(offers, lineItems, subtotal, isFirstOrder, primaryProduct) {
  const candidates = [];
  const first = offers.find((o) => o.offer_type === "first_order");
  const flat = offers.find((o) => o.offer_type === "flat_discount");
  const time = offers.find((o) => o.offer_type === "time_based");
  const prod = offers.find((o) => o.offer_type === "product_discount");
  const elec = offers.find((o) => o.offer_type === "category_discount" && o.resolvedCategoryKey === "electronics");
  const books = offers.find((o) => o.offer_type === "category_discount" && o.resolvedCategoryKey === "books");

  if (first && isFirstOrder && subtotal >= Number(first.min_purchase_amount)) candidates.push(first);
  if (flat && subtotal >= Number(flat.min_purchase_amount)) candidates.push(flat);
  if (time && subtotal >= Number(time.min_purchase_amount)) candidates.push(time);
  if (elec && lineItems.some((li) => li.product.root_key === "electronics") && subtotal >= Number(elec.min_purchase_amount)) candidates.push(elec);
  if (books && lineItems.some((li) => li.product.root_key === "books") && subtotal >= Number(books.min_purchase_amount)) candidates.push(books);
  if (prod && prod.resolvedProductId && lineItems.some((li) => li.product.id === prod.resolvedProductId) && subtotal >= Number(prod.min_purchase_amount)) candidates.push(prod);

  if (!candidates.length) return { offer: null, amount: 0 };
  const chosen = pick(candidates);
  let amt = chosen.discount_type === "percentage"
    ? round2((Number(chosen.discount_value) / 100) * subtotal)
    : Number(chosen.discount_value);
  amt = Math.min(amt, Number(chosen.maximum_discount_amount));
  return { offer: chosen, amount: round2(amt) };
}

async function generateHistory(conn, products, customerMap, addressMap, offers, adminId) {
  const seen = new Set();
  const rich = products.filter((p) => p.rich && p.history_months > 0);
  const customerIds = Object.values(customerMap);
  const customerFirstSeen = new Set();
  const summary = { orders: 0, items: 0, payments: 0, offer_usages: 0 };

  for (const product of rich) {
    const monthsList = pastMonths(product.history_months);
    for (let m = 0; m < monthsList.length; m += 1) {
      const month = monthsList[m];
      // Months-ago for this order (1..history_months; most recent = 1).
      const monthsAgo = monthsList.length - m;
      // Extras pool: minimal products OR rich products whose own history window
      // covers this month offset. Prevents short-history products from being
      // pulled into older orders of long-history products.
      const extrasPool = products.filter((c) =>
        c.id !== product.id && (c.history_months === 0 || monthsAgo <= c.history_months),
      );
      const volume = monthlyVolume();
      for (let i = 0; i < volume; i += 1) {
        const customerId = pick(customerIds);
        const addressId = addressMap[customerId];
        const createdAt = randomTimestampInMonth(month);
        const orderNumber = await genOrderNumber(conn, seen);

        // Line items: always include the rich product; 30% chance of extras.
        const lines = [{ product, quantity: randInt(1, 3) }];
        if (rnd() < 0.3 && extrasPool.length) {
          const extras = randInt(1, 2);
          for (let e = 0; e < extras; e += 1) {
            const candidate = pick(extrasPool);
            lines.push({ product: candidate, quantity: randInt(1, 2) });
          }
        }

        // Line math
        let subtotal = 0;
        let taxTotal = 0;
        const prepared = lines.map((l) => {
          const unit = l.product.effective_price;
          const sub = unit * l.quantity;
          const tax = round2(sub * (l.product.tax_percent / 100));
          subtotal += sub;
          taxTotal += tax;
          return { ...l, unit, sub: round2(sub), tax };
        });
        subtotal = round2(subtotal);
        taxTotal = round2(taxTotal);

        const shipping = subtotal > 5000 ? 0 : round2(49 + randInt(0, 10) * 10);

        // Offer logic: ~25% of orders use a valid offer.
        let discount = 0, appliedOffer = null;
        if (rnd() < 0.25) {
          const isFirst = !customerFirstSeen.has(customerId);
          const { offer, amount } = computeDiscountForOrder(offers, prepared, subtotal, isFirst, product);
          if (offer) { appliedOffer = offer; discount = amount; }
        }
        customerFirstSeen.add(customerId);

        const total = round2(subtotal + taxTotal + shipping - discount);
        const orderStatus = rnd() < 0.7 ? "delivered" : "completed";
        const createdStr = mysqlDT(createdAt);

        const [orderRes] = await conn.query(
          `INSERT INTO order_master (order_number, user_id, address_id, subtotal, tax_amount, shipping_amount,
             discount_amount, total_amount, order_status, payment_status, is_deleted,
             created_by, updated_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 0, ?, ?, ?, ?)`,
          [orderNumber, customerId, addressId, subtotal, taxTotal, shipping, discount, total,
           orderStatus, adminId, adminId, createdStr, createdStr],
        );
        const orderId = orderRes.insertId;

        // Distribute order-level discount across line items proportionally.
        for (const item of prepared) {
          const proportion = subtotal === 0 ? 0 : item.sub / subtotal;
          const lineDiscount = round2(discount * proportion);
          const lineTotal = round2(item.sub + item.tax - lineDiscount);
          await conn.query(
            `INSERT INTO order_items (order_id, product_id, product_portion_id, modifier_id, product_name, portion_value, modifier_value,
               quantity, price, discount, tax, total, created_by, updated_by, created_at, updated_at)
             VALUES (?, ?, NULL, NULL, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [orderId, item.product.id, item.product.display_name, item.quantity, item.unit,
             lineDiscount, item.tax, lineTotal, adminId, adminId, createdStr, createdStr],
          );
          summary.items += 1;
        }
        summary.orders += 1;

        // Payment
        const methods = orderStatus === "delivered" && rnd() < 0.2 ? PAYMENT_METHODS_ALL : PAYMENT_METHODS_ONLINE;
        const pm = pick(methods);
        const txn = pm === "cash_on_delivery" ? `COD-${String(randInt(10000000, 99999999))}` : `TXN-${String(randInt(1000000, 9999999))}`;
        const succeededAt = mysqlDT(new Date(createdAt.getTime() + randInt(10, 600) * 1000));
        await conn.query(
          `INSERT INTO payment_master (order_id, transaction_id, payment_method, amount, currency, status, payment_details,
             is_refunded, refund_amount, processing_started_at, succeeded_at, is_deleted,
             created_by, updated_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'INR', 'completed', ?, 0, 0, ?, ?, 0, ?, ?, ?, ?)`,
          [orderId, txn, pm, total, JSON.stringify({ method: pm, processed: true }),
           createdStr, succeededAt, adminId, adminId, createdStr, createdStr],
        );
        summary.payments += 1;

        if (appliedOffer && discount > 0) {
          await conn.query(
            `INSERT INTO offer_usage (offer_id, user_id, order_id, discount_amount, created_by, updated_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [appliedOffer.id, customerId, orderId, discount, adminId, adminId, createdStr, createdStr],
          );
          summary.offer_usages += 1;
        }
      }
    }
  }
  return summary;
}

// ---------- Reviews ----------
async function insertReviews(conn, products, customerMap, adminId) {
  const customerIds = Object.values(customerMap);
  let count = 0;
  for (const product of products.filter((p) => p.rich)) {
    // Find verified buyers (customers with matching order_items).
    const [buyers] = await conn.query(
      `SELECT DISTINCT om.user_id
         FROM order_items oi
         JOIN order_master om ON om.order_id = oi.order_id
        WHERE oi.product_id = ? AND oi.is_deleted = 0 AND om.is_deleted = 0
        LIMIT 20`,
      [product.id],
    );
    const buyerIds = buyers.map((b) => b.user_id);
    const target = randInt(3, 8);
    const usedUsers = new Set();
    for (let i = 0; i < target; i += 1) {
      // 70% verified-purchase reviewer, 30% any customer.
      const fromBuyer = buyerIds.length && rnd() < 0.7;
      const pool = fromBuyer ? buyerIds : customerIds;
      let userId;
      let attempts = 0;
      do {
        userId = pick(pool);
        attempts += 1;
      } while (usedUsers.has(userId) && attempts < 10);
      if (usedUsers.has(userId)) continue;
      usedUsers.add(userId);

      const bucket = rnd();
      const rating = bucket < 0.7 ? randInt(4, 5) : bucket < 0.9 ? 3 : randInt(1, 2);
      const title = rating >= 4 ? pick(REVIEW_POS_TITLES) : rating === 3 ? pick(REVIEW_MIXED_TITLES) : pick(REVIEW_NEG_TITLES);
      const body = rating >= 4 ? pick(REVIEW_POS_BODIES) : rating === 3 ? pick(REVIEW_MIXED_BODIES) : pick(REVIEW_NEG_BODIES);
      const status = rating <= 1 && rnd() < 0.5 ? "pending" : "approved";

      // Pick a related order for order_id linkage (buyer case).
      let orderId = null;
      if (fromBuyer) {
        const [rows] = await conn.query(
          `SELECT om.order_id FROM order_items oi JOIN order_master om ON om.order_id = oi.order_id
            WHERE oi.product_id = ? AND om.user_id = ? LIMIT 1`,
          [product.id, userId],
        );
        if (rows.length) orderId = rows[0].order_id;
      }

      const daysAgo = randInt(5, 220);
      const createdAt = new Date(Date.now() - daysAgo * 86400000);
      const createdStr = mysqlDT(createdAt);

      const [rev] = await conn.query(
        `INSERT INTO product_reviews (product_id, user_id, order_id, rating, title, review_text, status,
           is_verified_purchase, helpful_count, created_by, updated_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.id, userId, orderId, rating, title, body, status, fromBuyer ? 1 : 0, 0,
         adminId, adminId, createdStr, createdStr],
      );
      count += 1;

      // Helpful votes: 0-4 other customers.
      const helpfulCount = randInt(0, 4);
      const voters = new Set();
      let helpful = 0;
      for (let v = 0; v < helpfulCount; v += 1) {
        const voter = pick(customerIds);
        if (voter === userId || voters.has(voter)) continue;
        voters.add(voter);
        try {
          await conn.query(
            "INSERT INTO review_helpful (review_id, user_id, created_at) VALUES (?, ?, ?)",
            [rev.insertId, voter, createdStr],
          );
          helpful += 1;
        } catch {}
      }
      if (helpful > 0) {
        await conn.query("UPDATE product_reviews SET helpful_count = ? WHERE review_id = ?", [helpful, rev.insertId]);
      }
    }
  }
  return count;
}

// ---------- Activity logs ----------
async function insertActivityLogs(conn, adminId, sellerMap, customerMap, products) {
  const sellerIds = Object.values(sellerMap).map((s) => s.user_id);
  const customerIds = Object.values(customerMap);
  const TARGET = 40;
  let inserted = 0;
  for (let i = 0; i < TARGET; i += 1) {
    const action = pick(ACTIVITY_ACTIONS);
    let uid, entityId;
    switch (action.action) {
      case "login":
      case "logout":
        uid = pick([adminId, ...sellerIds, ...customerIds]); entityId = String(uid); break;
      case "product_create":
      case "product_update":
        uid = pick([adminId, ...sellerIds]); entityId = String(pick(products).id); break;
      case "order_placed":
        uid = pick(customerIds); entityId = String(randInt(1, 500)); break;
      case "order_status_update":
        uid = adminId; entityId = String(randInt(1, 500)); break;
      case "review_submitted":
        uid = pick(customerIds); entityId = String(pick(products.filter((p) => p.rich)).id); break;
      case "offer_created":
        uid = adminId; entityId = String(randInt(1, 6)); break;
      case "seller_approved":
        uid = adminId; entityId = String(pick(sellerIds)); break;
      default:
        uid = adminId; entityId = "0";
    }
    const daysAgo = randInt(1, 240);
    const createdAt = mysqlDT(new Date(Date.now() - daysAgo * 86400000 - randInt(0, 86400) * 1000));
    await conn.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uid, action.action, action.entity_type, entityId,
       JSON.stringify({ source: "seed", note: `${action.action} event` }),
       `10.0.${randInt(0, 255)}.${randInt(1, 254)}`,
       "Mozilla/5.0 (ShopSphere Demo Seeder)", createdAt],
    );
    inserted += 1;
  }
  return inserted;
}

// ---------- Summary ----------
async function printSummary(conn) {
  const [[row]] = await conn.query(`
    SELECT
      (SELECT COUNT(*) FROM user_master) users,
      (SELECT COUNT(*) FROM seller_profiles) sellers,
      (SELECT COUNT(*) FROM user_addresses) addresses,
      (SELECT COUNT(*) FROM category_master) categories,
      (SELECT COUNT(*) FROM portion_master) portions,
      (SELECT COUNT(*) FROM modifier_master) modifiers,
      (SELECT COUNT(*) FROM product_master) products,
      (SELECT COUNT(*) FROM product_portion) product_portions,
      (SELECT COUNT(*) FROM modifier_portion) modifier_portions,
      (SELECT COUNT(*) FROM product_images) product_images,
      (SELECT COUNT(*) FROM product_categories) product_categories,
      (SELECT COUNT(*) FROM offer_master) offers,
      (SELECT COUNT(*) FROM offer_product_category) offer_links,
      (SELECT COUNT(*) FROM offer_usage) offer_usages,
      (SELECT COUNT(*) FROM order_master) orders,
      (SELECT COUNT(*) FROM order_items) order_items,
      (SELECT COUNT(*) FROM payment_master) payments,
      (SELECT COUNT(*) FROM product_reviews) reviews,
      (SELECT COUNT(*) FROM review_helpful) review_helpful,
      (SELECT COUNT(*) FROM activity_logs) activity_logs
  `);
  console.log("\n=== Row counts after seed ===");
  for (const [k, v] of Object.entries(row)) {
    console.log(`  ${k.padEnd(22)} ${v}`);
  }
}

// ---------- Main ----------
async function seed() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("[1/10] Cleaning slate (preserving admin + app_settings)…");
    await cleanSlate(conn);

    console.log("[2/10] Ensuring admin user…");
    const adminId = await ensureAdmin(conn);

    console.log("[3/10] Inserting sellers + profiles…");
    const sellerMap = await insertSellers(conn, adminId);

    console.log("[4/10] Inserting customers + addresses…");
    const { userMap: customerMap, addressMap } = await insertCustomers(conn, adminId);

    console.log("[5/10] Inserting category tree, portions & modifiers…");
    const categoryMap = await insertCategories(conn, adminId);
    const portionMap = await insertPortions(conn, adminId);
    const modifierMap = await insertModifiers(conn, adminId);

    console.log("[6/10] Inserting 35 products + images…");
    const products = await insertProducts(conn, categoryMap, sellerMap, adminId);
    await insertProductPortionsAndModifiers(conn, products, portionMap, modifierMap, adminId);

    console.log("[7/10] Inserting offers + offer_product_category…");
    const offers = await insertOffers(conn, products, categoryMap, adminId);

    console.log("[8/10] Generating historical orders, items, payments, offer_usage…");
    const historySummary = await generateHistory(conn, products, customerMap, addressMap, offers, adminId);
    console.log(`       orders=${historySummary.orders} items=${historySummary.items} payments=${historySummary.payments} offer_usages=${historySummary.offer_usages}`);

    console.log("[9/10] Inserting product reviews + helpful votes…");
    const reviewCount = await insertReviews(conn, products, customerMap, adminId);
    console.log(`       reviews=${reviewCount}`);

    console.log("[10/10] Inserting activity logs…");
    const logCount = await insertActivityLogs(conn, adminId, sellerMap, customerMap, products);
    console.log(`        activity_logs=${logCount}`);

    await conn.commit();
    await printSummary(conn);
    console.log("\n✅ Seed completed successfully.");
  } catch (err) {
    await conn.rollback();
    console.error("\n❌ Seed failed — transaction rolled back.");
    console.error(err);
    throw err;
  } finally {
    conn.release();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
