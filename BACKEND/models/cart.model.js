import pool from "../configs/db.js";

async function getOrCreateCartByUserId(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM cart_master WHERE user_id = ? AND is_deleted = 0 LIMIT 1",
    [userId],
  );

  if (rows.length > 0) {
    return rows[0];
  }

  const [result] = await pool.query(
    "INSERT INTO cart_master (user_id, created_by, updated_by) VALUES (?, ?, ?)",
    [userId, userId, userId],
  );

  const cartId = result.insertId;

  return {
    cart_id: cartId,
    user_id: userId,
  };
}

async function getCartItemsWithProduct(cartId) {
  const [rows] = await pool.query(
    `SELECT ci.cart_item_id,
            ci.product_id,
            ci.quantity,
            ci.price AS effective_price,
            ci.product_portion_id,
            ci.modifier_id,
            pm.display_name,
            pm.short_description,
            por.portion_value,
            pp.price AS portion_price,
            pp.discounted_price AS portion_discounted_price,
            mt.modifier_name,
            mt.modifier_value
       FROM cart_items ci
       JOIN product_master pm ON pm.product_id = ci.product_id
       LEFT JOIN product_portion pp ON pp.product_portion_id = ci.product_portion_id AND pp.product_id = ci.product_id
       LEFT JOIN portion_master por ON por.portion_id = pp.portion_id
       LEFT JOIN modifier_master mt ON mt.modifier_id = ci.modifier_id
      WHERE ci.cart_id = ? AND ci.is_deleted = 0
      ORDER BY ci.cart_item_id`,
    [cartId],
  );

  return rows;
}

async function getCartScopeDetails(cartId) {
  const [rows] = await pool.query(
    `SELECT DISTINCT
            ci.product_id,
            COALESCE(pc.category_id, pm.category_id) AS category_id
       FROM cart_items ci
       JOIN product_master pm ON pm.product_id = ci.product_id
       LEFT JOIN product_categories pc ON pc.product_id = ci.product_id
      WHERE ci.cart_id = ? AND ci.is_deleted = 0`,
    [cartId],
  );

  const productIds = [...new Set(rows.map((row) => Number(row.product_id)))];
  const categoryIds = [
    ...new Set(
      rows
        .map((row) =>
          row.category_id === null ? null : Number(row.category_id),
        )
        .filter((id) => id !== null),
    ),
  ];

  return { productIds, categoryIds };
}

async function findCartItem(
  cartId,
  productId,
  productPortionId = null,
  modifierId = null,
) {
  let query =
    "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? AND is_deleted = 0";
  const params = [cartId, productId];

  if (productPortionId !== null) {
    query += " AND product_portion_id = ?";
    params.push(productPortionId);
  }

  if (modifierId !== null) {
    query += " AND modifier_id = ?";
    params.push(modifierId);
  }

  query += " LIMIT 1";

  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

async function insertCartItem({
  cartId,
  productId,
  quantity,
  price,
  productPortionId = null,
  modifierId = null,
  userId,
}) {
  const [result] = await pool.query(
    "INSERT INTO cart_items (cart_id, product_id, product_portion_id, modifier_id, quantity, price, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      cartId,
      productId,
      productPortionId,
      modifierId,
      quantity,
      price,
      userId,
      userId,
    ],
  );

  return result.insertId;
}

async function updateCartItemQuantity(cartItemId, quantity, userId) {
  await pool.query(
    "UPDATE cart_items SET quantity = ?, updated_by = ? WHERE cart_item_id = ?",
    [quantity, userId, cartItemId],
  );
}

async function deleteCartItem(cartItemId, userId) {
  await pool.query(
    "UPDATE cart_items SET is_deleted = 1, updated_by = ? WHERE cart_item_id = ?",
    [userId, cartItemId],
  );
}

async function getProductPricing(productId) {
  const [rows] = await pool.query(
    `SELECT product_id,

            display_name,

            price,

            discounted_price,

            is_active,

            is_deleted

       FROM product_master

      WHERE product_id = ?

      LIMIT 1`,

    [productId],
  );

  const product = rows[0];

  if (!product || product.is_deleted || !product.is_active) {
    return null;
  }

  const effectivePrice = product.discounted_price ?? product.price;

  return {
    productId: product.product_id,

    name: product.display_name,

    price: effectivePrice,
  };
}

async function getPortionPricing(productPortionId) {
  const [rows] = await pool.query(
    `SELECT pp.product_portion_id,
            pp.portion_id,
            pp.price,
            pp.discounted_price,
            pp.is_active,
            pp.is_deleted,
            por.portion_value
       FROM product_portion pp
       JOIN portion_master por ON por.portion_id = pp.portion_id
      WHERE pp.product_portion_id = ?
      LIMIT 1`,

    [productPortionId],
  );

  const portion = rows[0];

  if (!portion || portion.is_deleted || !portion.is_active) {
    return null;
  }

  return {
    productPortionId: portion.product_portion_id,

    portionId: portion.portion_id,

    portionValue: portion.portion_value,

    price: portion.discounted_price ?? portion.price,
  };
}

async function getModifierPricing(modifierPortionId) {
  const [rows] = await pool.query(
    `SELECT mp.modifier_portion_id,
            mp.modifier_id,
            mp.additional_price,
            mp.is_active,
            mm.modifier_name,
            mm.modifier_value
       FROM modifier_portion mp
       JOIN modifier_master mm ON mm.modifier_id = mp.modifier_id
      WHERE mp.modifier_portion_id = ?
        AND mp.is_deleted = 0
        AND mp.is_active = 1
        AND mm.is_deleted = 0
        AND mm.is_active = 1
      LIMIT 1`,
    [modifierPortionId],
  );

  const modifier = rows[0];

  if (!modifier) {
    return null;
  }

  return {
    modifierPortionId: modifier.modifier_portion_id,
    modifierId: modifier.modifier_id,
    modifierName: modifier.modifier_name,
    modifierValue: modifier.modifier_value,
    additionalPrice: modifier.additional_price,
  };
}

async function getFirstAvailablePortion(productId) {
  const [rows] = await pool.query(
    `SELECT pp.product_portion_id,
            pp.portion_id,
            pp.price,
            pp.discounted_price,
            pp.is_active,
            pp.is_deleted,
            por.portion_value
       FROM product_portion pp
       JOIN portion_master por ON por.portion_id = pp.portion_id
      WHERE pp.product_id = ? AND pp.is_deleted = 0 AND pp.is_active = 1
      ORDER BY pp.product_portion_id
      LIMIT 1`,
    [productId],
  );

  const portion = rows[0];

  if (!portion) {
    return null;
  }

  return {
    productPortionId: portion.product_portion_id,
    portionId: portion.portion_id,
    portionValue: portion.portion_value,
    price: portion.discounted_price ?? portion.price,
  };
}

// Get all modifiers for a cart item from cart_item_modifiers table
async function getCartItemModifiers(cartItemId) {
  const [rows] = await pool.query(
    `SELECT cim.modifier_portion_id,
            cim.modifier_id,
            cim.additional_price,
            mm.modifier_name,
            mm.modifier_value
       FROM cart_item_modifiers cim
       JOIN modifier_master mm ON mm.modifier_id = cim.modifier_id
      WHERE cim.cart_item_id = ?
      ORDER BY cim.cart_item_modifier_id`,
    [cartItemId],
  );
  return rows;
}

// Insert multiple modifiers for a cart item
async function insertCartItemModifiers(cartItemId, modifiers) {
  if (!modifiers || modifiers.length === 0) return;
  
  const values = modifiers.map(m => [
    cartItemId,
    m.modifierPortionId,
    m.modifierId,
    m.additionalPrice || 0,
  ]);
  
  await pool.query(
    `INSERT INTO cart_item_modifiers (cart_item_id, modifier_portion_id, modifier_id, additional_price)
     VALUES ?`,
    [values],
  );
}

// Delete all modifiers for a cart item
async function deleteCartItemModifiers(cartItemId) {
  await pool.query(
    `DELETE FROM cart_item_modifiers WHERE cart_item_id = ?`,
    [cartItemId],
  );
}

// Find cart item with matching portion and modifiers
async function findCartItemWithModifiers(cartId, productId, productPortionId, modifierPortionIds) {
  // First find cart items with matching product and portion
  let query = `SELECT ci.* FROM cart_items ci WHERE ci.cart_id = ? AND ci.product_id = ? AND ci.is_deleted = 0`;
  const params = [cartId, productId];
  
  if (productPortionId !== null) {
    query += " AND ci.product_portion_id = ?";
    params.push(productPortionId);
  } else {
    query += " AND ci.product_portion_id IS NULL";
  }
  
  const [rows] = await pool.query(query, params);
  
  if (rows.length === 0) return null;
  
  // Check each cart item for matching modifiers
  for (const row of rows) {
    const itemModifiers = await getCartItemModifiers(row.cart_item_id);
    const itemModifierIds = itemModifiers.map(m => m.modifier_portion_id).sort();
    const searchModifierIds = (modifierPortionIds || []).sort();
    
    if (itemModifierIds.length === searchModifierIds.length &&
        itemModifierIds.every((id, idx) => id === searchModifierIds[idx])) {
      return { ...row, modifiers: itemModifiers };
    }
  }
  
  return null;
}

// Get cart items with all their modifiers
async function getCartItemsWithModifiers(cartId) {
  const [rows] = await pool.query(
    `SELECT ci.cart_item_id,
            ci.product_id,
            ci.quantity,
            ci.price AS effective_price,
            ci.product_portion_id,
            pm.display_name,
            pm.short_description,
            por.portion_value,
            pp.price AS portion_price,
            pp.discounted_price AS portion_discounted_price
       FROM cart_items ci
       JOIN product_master pm ON pm.product_id = ci.product_id
       LEFT JOIN product_portion pp ON pp.product_portion_id = ci.product_portion_id AND pp.product_id = ci.product_id
       LEFT JOIN portion_master por ON por.portion_id = pp.portion_id
      WHERE ci.cart_id = ? AND ci.is_deleted = 0
      ORDER BY ci.cart_item_id`,
    [cartId],
  );

  // Fetch modifiers for each item
  const itemsWithModifiers = await Promise.all(
    rows.map(async (item) => {
      const modifiers = await getCartItemModifiers(item.cart_item_id);
      return { ...item, modifiers };
    })
  );

  return itemsWithModifiers;
}

export {
  getOrCreateCartByUserId,
  getCartItemsWithProduct,
  getCartScopeDetails,
  findCartItem,
  insertCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  getProductPricing,
  getPortionPricing,
  getModifierPricing,
  getFirstAvailablePortion,
  getCartItemModifiers,
  insertCartItemModifiers,
  deleteCartItemModifiers,
  findCartItemWithModifiers,
  getCartItemsWithModifiers,
};
