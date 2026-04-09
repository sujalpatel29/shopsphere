import bcrypt from "bcryptjs";
import pool from "../configs/db.js";

const ADMIN_PASSWORD = "Admin@123";
const SELLER_PASSWORD = "Seller@123";
const CUSTOMER_PASSWORD = "Customer@123";

const sellers = [
  {
    name: "Aarav Mehta",
    email: "seller.techkart@shopsphere.test",
    business_name: "TechKart India",
    business_description:
      "Consumer electronics store focused on premium phones, audio and creator gear.",
    business_address: "12 Linking Road, Bandra West, Mumbai, Maharashtra 400050",
    phone: "+91 98765 11001",
    gst_number: "27ABCDE1234F1Z5",
    bank_account_number: "50200011223344",
    bank_ifsc_code: "HDFC0001234",
    bank_account_holder: "TechKart India Pvt Ltd",
  },
  {
    name: "Neha Bansal",
    email: "seller.homeharvest@shopsphere.test",
    business_name: "HomeHarvest Living",
    business_description:
      "Curated home, kitchen and lifestyle essentials with a modern premium catalogue.",
    business_address: "44 Residency Road, Bengaluru, Karnataka 560025",
    phone: "+91 98765 11002",
    gst_number: "29FGHIJ5678K1Z2",
    bank_account_number: "091234567890",
    bank_ifsc_code: "ICIC0004567",
    bank_account_holder: "HomeHarvest Living LLP",
  },
  {
    name: "Riya Kapoor",
    email: "seller.fittrail@shopsphere.test",
    business_name: "FitTrail Sports",
    business_description:
      "Performance gear and wellness products for runners, gym users and everyday athletes.",
    business_address: "27 Sector 18, Noida, Uttar Pradesh 201301",
    phone: "+91 98765 11003",
    gst_number: "09KLMNO9012P1Z7",
    bank_account_number: "334455667788",
    bank_ifsc_code: "SBIN0003344",
    bank_account_holder: "FitTrail Sports",
  },
];

const customers = [
  {
    name: "Milan Bhimani",
    email: "milanhbhimani@gmail.com",
    phone: "+91 98111 22001",
    address_line1: "88 Palm Residency",
    city: "Hyderabad",
    state: "Telangana",
    postal_code: "500081",
  },
  {
    name: "Karan Malhotra",
    email: "karan.malhotra@shopsphere.test",
    phone: "+91 98111 22002",
    address_line1: "14 Golf Course Road",
    city: "Gurugram",
    state: "Haryana",
    postal_code: "122002",
  },
  {
    name: "Ananya Sen",
    email: "ananya.sen@shopsphere.test",
    phone: "+91 98111 22003",
    address_line1: "6 Ballygunge Park",
    city: "Kolkata",
    state: "West Bengal",
    postal_code: "700019",
  },
];

const categoryTree = [
  ["Electronics", "Mobiles", "Smartphones"],
  ["Electronics", "Computers", "Laptops"],
  ["Electronics", "Audio", "Headphones"],
  ["Home & Kitchen", "Kitchen Appliances", "Coffee Machines"],
  ["Home & Kitchen", "Furniture", "Office Chairs"],
  ["Sports & Fitness", "Fitness", "Wearables"],
  ["Sports & Fitness", "Fitness", "Recovery"],
];

const catalog = [
  {
    owner: "platform",
    category_path: ["Electronics", "Mobiles", "Smartphones"],
    name: "apple-iphone-15-pro-max",
    display_name: "Apple iPhone 15 Pro Max",
    description:
      "Titanium flagship smartphone with Pro camera system, long battery life and premium build quality.",
    short_description: "Titanium flagship with Pro camera system.",
    image_url:
      "https://images.pexels.com/photos/18809376/pexels-photo-18809376.jpeg?auto=compress&cs=tinysrgb&w=1200",
    base_price: 159900,
    stock: 48,
    portions: [
      { value: "256GB", price: 159900, stock: 24 },
      { value: "512GB", price: 179900, stock: 16 },
      { value: "1TB", price: 199900, stock: 8 },
    ],
    modifiers: [{ name: "Color", values: ["Natural Titanium", "Black Titanium", "White Titanium"], additional_price: 0, stock: 80 }],
  },
  {
    owner: "platform",
    category_path: ["Electronics", "Computers", "Laptops"],
    name: "dell-xps-15-oled",
    display_name: "Dell XPS 15 OLED",
    description:
      "Premium Windows laptop with OLED display, creator-focused performance and elegant industrial design.",
    short_description: "Creator-class OLED laptop.",
    image_url:
      "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200",
    base_price: 179999,
    stock: 22,
    portions: [
      { value: "16GB / 512GB SSD", price: 179999, stock: 10 },
      { value: "32GB / 1TB SSD", price: 204999, stock: 8 },
      { value: "64GB / 2TB SSD", price: 249999, stock: 4 },
    ],
    modifiers: [{ name: "Graphics", values: ["RTX 4050", "RTX 4060"], additional_price: 0, stock: 40 }],
  },
  {
    owner: "platform",
    category_path: ["Home & Kitchen", "Kitchen Appliances", "Coffee Machines"],
    name: "breville-barista-express",
    display_name: "Breville Barista Express",
    description:
      "All-in-one espresso machine with integrated grinder for cafe-style coffee at home.",
    short_description: "Espresso machine with built-in grinder.",
    image_url:
      "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=1200",
    base_price: 62999,
    stock: 14,
    portions: [{ value: "Standard", price: 62999, stock: 14 }],
    modifiers: [{ name: "Finish", values: ["Brushed Steel", "Black Truffle"], additional_price: 0, stock: 20 }],
  },
  {
    owner: "TechKart India",
    category_path: ["Electronics", "Audio", "Headphones"],
    name: "sony-wh-1000xm5",
    display_name: "Sony WH-1000XM5 Wireless",
    description:
      "Industry-leading ANC headphones with premium comfort and excellent call clarity.",
    short_description: "Flagship ANC over-ear headphones.",
    image_url:
      "https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg?auto=compress&cs=tinysrgb&w=1200",
    base_price: 29990,
    stock: 55,
    portions: [{ value: "Standard Edition", price: 29990, stock: 55 }],
    modifiers: [{ name: "Color", values: ["Black", "Silver", "Midnight Blue"], additional_price: 0, stock: 100 }],
  },
  {
    owner: "TechKart India",
    category_path: ["Electronics", "Mobiles", "Smartphones"],
    name: "nothing-phone-2",
    display_name: "Nothing Phone (2)",
    description:
      "Distinctive Android phone with Glyph interface, smooth OLED display and clean software experience.",
    short_description: "Minimal Android flagship with Glyph design.",
    image_url:
      "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=1200",
    base_price: 44999,
    stock: 38,
    portions: [
      { value: "128GB", price: 44999, stock: 18 },
      { value: "256GB", price: 49999, stock: 20 },
    ],
    modifiers: [{ name: "Color", values: ["Dark Gray", "White"], additional_price: 0, stock: 60 }],
  },
  {
    owner: "HomeHarvest Living",
    category_path: ["Home & Kitchen", "Furniture", "Office Chairs"],
    name: "herman-miller-aeron-remastered",
    display_name: "Aeron Remastered Chair",
    description:
      "Iconic ergonomic office chair designed for all-day support and breathable comfort.",
    short_description: "Premium ergonomic office chair.",
    image_url:
      "https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=1200",
    base_price: 89999,
    stock: 11,
    portions: [
      { value: "Size B", price: 89999, stock: 6 },
      { value: "Size C", price: 94999, stock: 5 },
    ],
    modifiers: [{ name: "Finish", values: ["Graphite", "Mineral", "Onyx"], additional_price: 0, stock: 20 }],
  },
  {
    owner: "HomeHarvest Living",
    category_path: ["Home & Kitchen", "Kitchen Appliances", "Coffee Machines"],
    name: "nespresso-vertuo-pop",
    display_name: "Nespresso Vertuo Pop",
    description:
      "Compact pod coffee machine with vibrant finish options and one-touch brewing.",
    short_description: "Compact premium pod coffee machine.",
    image_url:
      "https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=1200",
    base_price: 14999,
    stock: 28,
    portions: [{ value: "Standard", price: 14999, stock: 28 }],
    modifiers: [{ name: "Color", values: ["Pacific Blue", "Mango Yellow", "Coconut White"], additional_price: 0, stock: 40 }],
  },
  {
    owner: "FitTrail Sports",
    category_path: ["Sports & Fitness", "Fitness", "Wearables"],
    name: "garmin-forerunner-265",
    display_name: "Garmin Forerunner 265",
    description:
      "Advanced AMOLED running smartwatch with training readiness, GPS precision and recovery insights.",
    short_description: "AMOLED performance running watch.",
    image_url:
      "https://images.pexels.com/photos/2773940/pexels-photo-2773940.jpeg?auto=compress&cs=tinysrgb&w=1200",
    base_price: 42990,
    stock: 19,
    portions: [
      { value: "42mm", price: 42990, stock: 10 },
      { value: "46mm", price: 44990, stock: 9 },
    ],
    modifiers: [{ name: "Color", values: ["Black", "Aqua", "Whitestone"], additional_price: 0, stock: 40 }],
  },
  {
    owner: "FitTrail Sports",
    category_path: ["Sports & Fitness", "Fitness", "Recovery"],
    name: "therabody-theragun-prime",
    display_name: "Therabody Theragun Prime",
    description:
      "Percussive therapy device for muscle recovery, warm-up and daily mobility routines.",
    short_description: "Premium percussive recovery device.",
    image_url:
      "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=1200",
    base_price: 24999,
    stock: 24,
    portions: [{ value: "Standard Kit", price: 24999, stock: 24 }],
    modifiers: [{ name: "Color", values: ["Black", "Sand"], additional_price: 0, stock: 30 }],
  },
];

async function ensureCategory(conn, path, adminId) {
  let parentId = null;
  for (const name of path) {
    const [rows] = await conn.query(
      "SELECT category_id FROM category_master WHERE category_name = ? AND ((parent_id IS NULL AND ? IS NULL) OR parent_id = ?)",
      [name, parentId, parentId],
    );
    if (rows.length) {
      parentId = rows[0].category_id;
      continue;
    }
    const [result] = await conn.query(
      "INSERT INTO category_master (category_name, parent_id, created_by, updated_by) VALUES (?, ?, ?, ?)",
      [name, parentId, adminId, adminId],
    );
    parentId = result.insertId;
  }
  return parentId;
}

async function ensurePortion(conn, value, adminId) {
  const [result] = await conn.query(
    `INSERT INTO portion_master (portion_value, is_active, created_by, updated_by)
     VALUES (?, 1, ?, ?)
     ON DUPLICATE KEY UPDATE portion_id = LAST_INSERT_ID(portion_id), updated_by = VALUES(updated_by)`,
    [value, adminId, adminId],
  );
  return result.insertId;
}

async function ensureModifier(conn, name, value, type, adminId) {
  const [result] = await conn.query(
    `INSERT INTO modifier_master (modifier_name, modifier_value, modifier_type, is_active, created_by, updated_by)
     VALUES (?, ?, ?, 1, ?, ?)
     ON DUPLICATE KEY UPDATE modifier_id = LAST_INSERT_ID(modifier_id), modifier_type = VALUES(modifier_type), updated_by = VALUES(updated_by)`,
    [name, value, type, adminId, adminId],
  );
  return result.insertId;
}

function orderNumber(index) {
  return `SS-2026-${String(index).padStart(4, "0")}`;
}

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log("Starting real-world database seed...");
    await conn.beginTransaction();
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");

    const cleanupOrder = [
      "review_helpful",
      "product_reviews",
      "order_item_modifiers",
      "order_items",
      "order_master",
      "cart_items",
      "cart_master",
      "offer_usage",
      "offer_product_category",
      "offer_master",
      "activity_logs",
      "product_images",
      "modifier_combination_items",
      "modifier_combination",
      "modifier_portion",
      "product_portion",
      "product_categories",
      "product_master",
      "seller_profiles",
      "user_addresses",
      "category_master",
      "portion_master",
      "modifier_master",
      "user_master",
    ];

    for (const table of cleanupOrder) {
      await conn.query(`TRUNCATE TABLE ${table}`);
    }
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const sellerHash = await bcrypt.hash(SELLER_PASSWORD, 10);
    const customerHash = await bcrypt.hash(CUSTOMER_PASSWORD, 10);

    const [adminResult] = await conn.query(
      `INSERT INTO user_master (name, email, password, role, is_seller, seller_status)
       VALUES (?, ?, ?, 'admin', 0, NULL)`,
      ["Platform Admin", "admin@shopsphere.test", adminHash],
    );
    const adminId = adminResult.insertId;

    const sellerIds = {};
    for (const seller of sellers) {
      const [userResult] = await conn.query(
        `INSERT INTO user_master (name, email, password, role, is_seller, seller_status, created_by, updated_by)
         VALUES (?, ?, ?, 'seller', 1, 'approved', ?, ?)`,
        [seller.name, seller.email, sellerHash, adminId, adminId],
      );
      const sellerId = userResult.insertId;
      sellerIds[seller.business_name] = sellerId;

      await conn.query(
        `INSERT INTO seller_profiles
         (seller_id, business_name, business_description, business_address, phone, gst_number,
          bank_account_number, bank_ifsc_code, bank_account_holder, verification_status, verified_by, verified_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, NOW())`,
        [
          sellerId,
          seller.business_name,
          seller.business_description,
          seller.business_address,
          seller.phone,
          seller.gst_number,
          seller.bank_account_number,
          seller.bank_ifsc_code,
          seller.bank_account_holder,
          adminId,
        ],
      );
    }

    const customerIds = [];
    const addressIds = [];
    for (const customer of customers) {
      const [userResult] = await conn.query(
        `INSERT INTO user_master (name, email, password, role, created_by, updated_by)
         VALUES (?, ?, ?, 'customer', ?, ?)`,
        [customer.name, customer.email, customerHash, adminId, adminId],
      );
      const customerId = userResult.insertId;
      customerIds.push(customerId);

      const [addressResult] = await conn.query(
        `INSERT INTO user_addresses
         (user_id, address_type, full_name, phone, address_line1, city, state, postal_code, country, is_default, created_by, updated_by)
         VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, 'India', 1, ?, ?)`,
        [
          customerId,
          customer.name,
          customer.phone,
          customer.address_line1,
          customer.city,
          customer.state,
          customer.postal_code,
          adminId,
          adminId,
        ],
      );
      addressIds.push(addressResult.insertId);
    }

    for (const path of categoryTree) {
      await ensureCategory(conn, path, adminId);
    }

    const productIds = [];
    for (const item of catalog) {
      const categoryId = await ensureCategory(conn, item.category_path, adminId);
      const createdBy = item.owner === "platform" ? adminId : sellerIds[item.owner];
      const sellerId = item.owner === "platform" ? null : sellerIds[item.owner];

      const [productResult] = await conn.query(
        `INSERT INTO product_master
         (name, display_name, description, short_description, price, discounted_price, stock, category_id, seller_id, is_active, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          item.name,
          item.display_name,
          item.description,
          item.short_description,
          item.base_price,
          null,
          item.stock,
          categoryId,
          sellerId,
          createdBy,
          createdBy,
        ],
      );
      const productId = productResult.insertId;
      productIds.push(productId);

      await conn.query(
        "INSERT INTO product_categories (product_id, category_id, created_by, updated_by) VALUES (?, ?, ?, ?)",
        [productId, categoryId, createdBy, createdBy],
      );

      await conn.query(
        `INSERT INTO product_images (product_id, image_level, image_url, public_id, is_primary, created_by, updated_by)
         VALUES (?, 'PRODUCT', ?, ?, 1, ?, ?)`,
        [productId, item.image_url, `seed-product-${productId}`, createdBy, createdBy],
      );

      const productPortions = [];
      for (const portion of item.portions) {
        const portionMasterId = await ensurePortion(conn, portion.value, adminId);
        const [portionResult] = await conn.query(
          `INSERT INTO product_portion
           (product_id, portion_id, price, discounted_price, stock, is_active, created_by, updated_by)
           VALUES (?, ?, ?, NULL, ?, 1, ?, ?)`,
          [productId, portionMasterId, portion.price, portion.stock, createdBy, createdBy],
        );
        productPortions.push({
          product_portion_id: portionResult.insertId,
          value: portion.value,
          stock: portion.stock,
        });
      }

      for (const modifierGroup of item.modifiers) {
        const modifierIds = [];
        for (const value of modifierGroup.values) {
          const modifierId = await ensureModifier(
            conn,
            modifierGroup.name,
            value,
            modifierGroup.name,
            adminId,
          );
          modifierIds.push({ modifierId, value });

          await conn.query(
            `INSERT IGNORE INTO modifier_portion
             (modifier_id, product_id, additional_price, stock, is_active, created_by, updated_by)
             VALUES (?, ?, ?, ?, 1, ?, ?)`,
            [
              modifierId,
              productId,
              modifierGroup.additional_price || 0,
              modifierGroup.stock || item.stock,
              createdBy,
              createdBy,
            ],
          );
        }

        for (const portion of productPortions) {
          for (const modifier of modifierIds) {
            const [comboResult] = await conn.query(
              `INSERT INTO modifier_combination
               (product_id, product_portion_id, name, additional_price, stock, is_active, created_by, updated_by)
               VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
              [
                productId,
                portion.product_portion_id,
                `${portion.value} / ${modifier.value}`,
                modifierGroup.additional_price || 0,
                Math.max(1, Math.floor((portion.stock || item.stock) / modifierIds.length)),
                createdBy,
                createdBy,
              ],
            );

            await conn.query(
              "INSERT INTO modifier_combination_items (combination_id, modifier_id) VALUES (?, ?)",
              [comboResult.insertId, modifier.modifierId],
            );
          }
        }
      }
    }

    const seededOrders = [
      {
        customerIndex: 0,
        status: "processing",
        payment_status: "completed",
        items: [
          { productIndex: 3, portionValue: "Standard Edition", quantity: 1, price: 29990 },
          { productIndex: 5, portionValue: "Size B", quantity: 1, price: 89999 },
        ],
      },
      {
        customerIndex: 1,
        status: "delivered",
        payment_status: "completed",
        items: [
          { productIndex: 7, portionValue: "42mm", quantity: 1, price: 42990 },
          { productIndex: 8, portionValue: "Standard Kit", quantity: 1, price: 24999 },
        ],
      },
      {
        customerIndex: 2,
        status: "shipped",
        payment_status: "completed",
        items: [
          { productIndex: 0, portionValue: "256GB", quantity: 1, price: 159900 },
          { productIndex: 6, portionValue: "Standard", quantity: 1, price: 14999 },
        ],
      },
    ];

    for (let index = 0; index < seededOrders.length; index += 1) {
      const order = seededOrders[index];
      const customerId = customerIds[order.customerIndex];
      const addressId = addressIds[order.customerIndex];
      const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = Math.round(subtotal * 0.18);
      const shipping = subtotal > 50000 ? 0 : 199;
      const total = subtotal + tax + shipping;

      const [orderResult] = await conn.query(
        `INSERT INTO order_master
         (order_number, user_id, address_id, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, order_status, payment_status, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
        [
          orderNumber(index + 1),
          customerId,
          addressId,
          subtotal,
          tax,
          shipping,
          total,
          order.status,
          order.payment_status,
          customerId,
          customerId,
        ],
      );
      const orderId = orderResult.insertId;

      for (const item of order.items) {
        const productId = productIds[item.productIndex];
        const [portionRows] = await conn.query(
          `SELECT pp.product_portion_id
           FROM product_portion pp
           JOIN portion_master pm ON pm.portion_id = pp.portion_id
           WHERE pp.product_id = ? AND pm.portion_value = ? LIMIT 1`,
          [productId, item.portionValue],
        );

        const portionId = portionRows[0]?.product_portion_id ?? null;
        const lineTotal = item.price * item.quantity;
        const [orderItemResult] = await conn.query(
          `INSERT INTO order_items
           (order_id, product_id, product_portion_id, modifier_id, product_name, portion_value, modifier_value, quantity, price, discount, tax, total, created_by, updated_by)
           VALUES (?, ?, ?, NULL, ?, ?, NULL, ?, ?, 0, ?, ?, ?, ?)`,
          [
            orderId,
            productId,
            portionId,
            catalog[item.productIndex].display_name,
            item.portionValue,
            item.quantity,
            item.price,
            Math.round(lineTotal * 0.18),
            lineTotal + Math.round(lineTotal * 0.18),
            customerId,
            customerId,
          ],
        );

        const [modifierRows] = await conn.query(
          `SELECT mm.modifier_id, mm.modifier_name, mm.modifier_value
           FROM modifier_master mm
           JOIN modifier_portion mp ON mp.modifier_id = mm.modifier_id
           WHERE mp.product_id = ?
           ORDER BY mm.modifier_id ASC
           LIMIT 1`,
          [productId],
        );

        if (modifierRows[0]) {
          await conn.query(
            `INSERT INTO order_item_modifiers
             (order_item_id, modifier_id, modifier_name, modifier_value, modifier_type, additional_price)
             VALUES (?, ?, ?, ?, ?, 0)`,
            [
              orderItemResult.insertId,
              modifierRows[0].modifier_id,
              modifierRows[0].modifier_name,
              modifierRows[0].modifier_value,
              modifierRows[0].modifier_name,
            ],
          );
        }
      }
    }

    await conn.commit();
    console.log("Seed completed.");
    console.log(`Admin login: admin@shopsphere.test / ${ADMIN_PASSWORD}`);
    console.log(`Seller login: seller.techkart@shopsphere.test / ${SELLER_PASSWORD}`);
    console.log(`Customer login: milanhbhimani@gmail.com / ${CUSTOMER_PASSWORD}`);
  } catch (error) {
    await conn.rollback();
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
