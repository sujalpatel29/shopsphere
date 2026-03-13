import pool from "../configs/db.js";

import {

  getOrCreateCartByUserId,

  getCartItemsWithProduct,

  findCartItem,

  insertCartItem,

  updateCartItemQuantity,

  deleteCartItem,

  getProductPricing,

  getPortionPricing,

  getModifierPricing,

  getFirstAvailablePortion

} from "../models/cart.model.js";

import {

  getCartWithOffer,
  getCartItemsWithOffer,
  getApplicableOffersForProduct,
  getApplicableCartOffers,
  getOfferUsageCount,
  applyOfferToCart,
  applyOfferToCartItem,
  removeOfferFromCart,
  removeOfferFromCartItem

} from "../models/offer.model.js";

import { getRootCategoryId } from "../models/Order_master.model.js";
import { getDefaultAddressModel } from "../models/user.address.model.js";

import {

  ok,

  created,

  badRequest,

  unauthorized,

  notFound,

  serverError

} from "../utils/apiResponse.js";



/**

 * Parse and validate positive integer values

 * @param {string|number} value - Value to parse

 * @returns {number|null} Parsed integer or null if invalid

 */

function parsePositiveInt(value) {

  const num = Number.parseInt(value, 10);

  if (Number.isNaN(num) || num <= 0) {

    return null;

  }

  return num;

}

// Cart limits constants
const CART_LIMITS = {
  MAX_ITEMS: 20,
  MAX_TOTAL_VALUE: 1000000, // 10 lakh in rupees
  MAX_QUANTITY_PER_PRODUCT: 5 // Max 5 of same product
};

/**
 * Validate cart limits before adding/updating items
 * @param {number} cartId - Cart ID
 * @param {number} additionalQuantity - Quantity being added (for item count check)
 * @param {number} valueToAdd - Total value to add to cart
 * @param {number} excludeCartItemId - Cart item ID to exclude (for updates)
 * @returns {Object} { valid, error, currentItemCount, currentTotal }
 */
async function validateCartLimits(cartId, additionalQuantity, valueToAdd, excludeCartItemId = null) {
  const [rows] = await pool.query(
    `SELECT 
      COUNT(*) as item_count,
      SUM(ci.quantity * ci.price) as total_value
    FROM cart_items ci
    WHERE ci.cart_id = ? AND ci.is_deleted = 0
      ${excludeCartItemId ? 'AND ci.cart_item_id != ?' : ''}`,
    excludeCartItemId ? [cartId, excludeCartItemId] : [cartId]
  );

  const currentItemCount = Number(rows[0].item_count) || 0;
  const currentTotal = Number(rows[0].total_value) || 0;
  const newTotal = currentTotal + valueToAdd;

  console.log('Cart limit check:', { cartId, currentItemCount, currentTotal, valueToAdd, newTotal, excludeCartItemId });

  // Check item count limit (count unique items, not total quantity)
  if (!excludeCartItemId && currentItemCount >= CART_LIMITS.MAX_ITEMS) {
    return {
      valid: false,
      error: `Cart cannot have more than ${CART_LIMITS.MAX_ITEMS} different items`,
      currentItemCount,
      currentTotal
    };
  }

  // Check total value limit
  if (newTotal > CART_LIMITS.MAX_TOTAL_VALUE) {
    return {
      valid: false,
      error: `Cart total cannot exceed ₹${(CART_LIMITS.MAX_TOTAL_VALUE / 100000).toFixed(1)} lakh. Current: ₹${(currentTotal/100000).toFixed(1)} lakh, Adding: ₹${(valueToAdd/100000).toFixed(1)} lakh`,
      currentItemCount,
      currentTotal
    };
  }

  return { valid: true, currentItemCount, currentTotal };
}

// Find root category ID for tax calculation
const findRootCategory = async (categoryId) => {
  const rows = await getRootCategoryId(categoryId);
  return rows[0]?.category_id;
};

// Get tax percentage based on root category
const getTaxPercent = (rootCategoryId) => {
  const TAX_RULES = {
    1: 18,   // Category 1: 18% tax
    27: 5    // Category 27: 5% tax
  };
  return TAX_RULES[rootCategoryId] || 0;
};

// Calculate tax for cart items
const calculateCartTax = async (items) => {
  // Return empty result if no items
  if (!items || items.length === 0) {
    return { items: [], totalTax: 0 };
  }
  
  // Get unique product IDs with their categories
  const productIds = [...new Set(items.map(item => item.product_id))];
  
  // Fetch categories for products
  const [products] = await pool.query(
    `SELECT product_id, category_id FROM product_master WHERE product_id IN (?)`,
    [productIds]
  );
  
  const productCategoryMap = {};
  products.forEach(p => {
    productCategoryMap[p.product_id] = p.category_id;
  });
  
  // Get root categories for tax calculation
  const rootCategoryEntries = await Promise.all(
    productIds.map(async (productId) => {
      const categoryId = productCategoryMap[productId];
      const rootId = await findRootCategory(categoryId);
      return [productId, rootId];
    })
  );
  const rootCategoryMap = Object.fromEntries(rootCategoryEntries);
  
  // Calculate tax for each item
  let totalTax = 0;
  const itemsWithTax = items.map(item => {
    const categoryId = rootCategoryMap[item.product_id];
    const taxPercent = getTaxPercent(categoryId);
    const itemPrice = Number(item.effective_price) * item.quantity;
    const taxAmount = (itemPrice * taxPercent) / 100;
    totalTax += taxAmount;
    
    return {
      ...item,
      tax_percent: taxPercent,
      tax_amount: Math.round(taxAmount * 100) / 100
    };
  });
  
  return {
    items: itemsWithTax,
    totalTax: Math.round(totalTax * 100) / 100
  };
};



/**

 * Calculate discount amount based on offer details

 * @param {Object} offer - Offer details

 * @param {number} subtotal - Subtotal amount

 * @returns {number} Discount amount

 */

function calculateDiscount(offer, subtotal) {

  if (!offer) return 0;

  const discountType = offer.discount_type.toLowerCase();

  let discountAmount = 0;

  if (discountType === 'percentage') {

    discountAmount = (subtotal * offer.discount_value) / 100;

    if (offer.maximum_discount_amount && discountAmount > offer.maximum_discount_amount) {

      discountAmount = offer.maximum_discount_amount;

    }

  } else if (discountType === 'fixed_amount') {

    discountAmount = Math.min(offer.discount_value, subtotal);

  }

  return Math.round(discountAmount * 100) / 100;

}



/**

 * Build cart response object with totals and offer details

 * @param {number} cartId - Cart ID

 * @param {Array} items - Cart items with product details

 * @param {Object} cartOffer - Cart-level offer details (optional)

 * @returns {Object} Cart response with items, subtotal, discount, total

 */

async function buildCartResponse(cartId, items, cartOffer = null, userId = null) {
  // Get user's default address if userId provided
  let address = null;
  if (userId) {
    try {
      const addressResult = await getDefaultAddressModel(userId);
      if (addressResult && addressResult.length > 0) {
        address = addressResult[0];
      }
    } catch (addrError) {
      console.error("Error fetching default address:", addrError);
      // Continue without address - don't fail the whole cart
    }
  }

  // Calculate tax for items first
  const { items: itemsWithTax, totalTax } = await calculateCartTax(items);

  // Calculate item-level discounts

  let subtotal = 0;

  let totalItemDiscount = 0;

  const itemsWithDiscount = itemsWithTax.map((item) => {

    const itemPrice = Number(item.effective_price);

    const lineTotal = itemPrice * item.quantity;

    subtotal += lineTotal;

    let itemDiscount = 0;

    let appliedItemOffer = null;

    // Apply item-level offer if available

    if (item.item_offer_id && item.item_offer_name) {

      const itemOffer = {

        offer_id: item.item_offer_id,

        offer_name: item.item_offer_name,

        offer_type: item.item_offer_type,

        discount_type: item.item_discount_type,

        discount_value: item.item_discount_value,

        maximum_discount_amount: item.item_max_discount

      };

      itemDiscount = calculateDiscount(itemOffer, lineTotal);

      totalItemDiscount += itemDiscount;

      appliedItemOffer = {

        offer_id: itemOffer.offer_id,

        offer_name: itemOffer.offer_name,

        discount_amount: itemDiscount

      };

    }

    return {

      cartItemId: item.cart_item_id,

      productId: item.product_id,

      productName: item.display_name,

      shortDescription: item.short_description,

      quantity: item.quantity,

      price: itemPrice,

      lineTotal: lineTotal,

      portionPrice: item.portion_price ? Number(item.portion_price) : null,

      portionDiscountedPrice: item.portion_discounted_price ? Number(item.portion_discounted_price) : null,

      portionId: item.portion_id,

      portionValue: item.portion_value,

      modifierId: item.modifier_id,

      modifierName: item.modifier_name,

      modifierValue: item.modifier_value,

      appliedOffer: appliedItemOffer,

      discountedLineTotal: lineTotal - itemDiscount,

      taxPercent: item.tax_percent,

      taxAmount: item.tax_amount

    };

  });

  // Calculate cart-level discount

  let cartDiscount = 0;

  let appliedCartOffer = null;

  if (cartOffer) {

    // Check if offer can be applied

    if (cartOffer.min_purchase_amount && subtotal < cartOffer.min_purchase_amount) {

      // Offer not applicable due to minimum purchase requirement

      cartOffer = null;

    } else {

      cartDiscount = calculateDiscount(cartOffer, subtotal);

      appliedCartOffer = {

        offer_id: cartOffer.offer_id,

        offer_name: cartOffer.offer_name,

        discount_amount: cartDiscount

      };

    }

  }

  const totalDiscount = totalItemDiscount + cartDiscount;

  const total = Math.max(0, subtotal + totalTax - totalDiscount);

  return {

    cartId,

    items: itemsWithDiscount,

    subtotal: Math.round(subtotal * 100) / 100,

    tax: totalTax,

    itemDiscount: Math.round(totalItemDiscount * 100) / 100,

    cartDiscount: Math.round(cartDiscount * 100) / 100,

    discount: Math.round(totalDiscount * 100) / 100,

    total: Math.round(total * 100) / 100,

    appliedCartOffer,

    address

  };

}



/**

 * Get current user's cart

 * Requires authentication (userId from JWT token)

 * 

 * GET /api/cart

 * Headers: Authorization: Bearer <token>

 */

async function getCart(req, res) {
  try {
    // Cart is attached by validateCart middleware
    const cartId = req.cart.cart_id;
    const userId = req.user.id;
    console.log("getCart called - cartId:", cartId, "userId:", userId);

    // Get cart with offer details
    const cartData = await getCartWithOffer(cartId);
    const cart = cartData[0];

    // Get cart items with offer details
    const items = await getCartItemsWithOffer(cartId);

    // Build response with offer calculations
    const cartOffer = cart.offer_id ? {
      offer_id: cart.offer_id,
      offer_name: cart.offer_name,
      offer_type: cart.offer_type,
      discount_type: cart.discount_type,
      discount_value: cart.discount_value,
      maximum_discount_amount: cart.maximum_discount_amount,
      min_purchase_amount: cart.min_purchase_amount,
      usage_limit_per_user: cart.usage_limit_per_user
    } : null;

    const response = await buildCartResponse(cartId, items, cartOffer, userId);

    return ok(res, "Cart retrieved successfully", response);
  } catch (err) {
    console.error("Error in getCart:", err);
    console.error("Error stack:", err.stack);
    return serverError(res, "Internal server error");
  }
}



/**

 * Add item to cart (add quantity if already present)

 * Requires authentication (userId from JWT token)

 * 

 * POST /api/cart/items

 * Headers: Authorization: Bearer <token>

 * Body: { productId, quantity, portionId?, modifierId? }

 */

async function addItemToCart(req, res) {

  try {

    // User ID comes from JWT token (authMiddleware)
    const userId = req.user.id;

    // Cart is attached by validateCart middleware
    const { productId, quantity, portionId, modifierId } = req.body;



    const parsedProductId = parsePositiveInt(productId);

    const parsedQuantity = parsePositiveInt(quantity);

    const parsedPortionId = portionId ? parsePositiveInt(portionId) : null;

    const parsedModifierId = modifierId ? parsePositiveInt(modifierId) : null;



    if (!parsedProductId || !parsedQuantity) {

      return badRequest(res, "Invalid productId or quantity");

    }



    const pricing = await getProductPricing(parsedProductId);



    if (!pricing) {

      return notFound(res, "Product not found or inactive");

    }



    let itemPrice = Number(pricing.price);
    let finalPortionId = parsedPortionId;



    // If portion is provided, validate it. If not, auto-select first available portion
    if (parsedPortionId) {

      const portionPricing = await getPortionPricing(parsedPortionId);

      if (!portionPricing) {

        return badRequest(res, "Invalid portion specified. This portion does not exist or is inactive.");

      }

      itemPrice = Number(portionPricing.price);

    } else {

      // Auto-select first available portion
      const defaultPortion = await getFirstAvailablePortion(parsedProductId);

      if (defaultPortion) {

        finalPortionId = defaultPortion.productPortionId;

        itemPrice = Number(defaultPortion.price);

      } else {

        // If no portion exists, use base product price
        finalPortionId = null;
        itemPrice = Number(pricing.price);
      }

    }



    // If modifier is provided, add modifier's additional price
    if (parsedModifierId) {
      const modifierPricing = await getModifierPricing(parsedModifierId);
      if (!modifierPricing) {
        return badRequest(res, "Invalid modifier specified. This modifier does not exist or is inactive.");
      }
      itemPrice = Math.round((itemPrice + Number(modifierPricing.additionalPrice)) * 1000) / 1000;
    } else {
      itemPrice = Math.round(itemPrice * 1000) / 1000;
    }



    const existingItem = await findCartItem(req.cart.cart_id, parsedProductId, finalPortionId, parsedModifierId);


    // Validate cart limits
    // Calculate the additional value being added
    let additionalValue = parsedQuantity * itemPrice;
    let excludeCartItemId = null;
    
    if (existingItem) {
      // If updating existing item, we need to account for the difference
      // Exclude existing item from current total, then add the NEW total value
      excludeCartItemId = existingItem.cart_item_id;
      const newQuantity = existingItem.quantity + parsedQuantity;
      additionalValue = newQuantity * itemPrice; // Full new value, not just additional
    }
    
    const limitCheck = await validateCartLimits(
      req.cart.cart_id,
      1, // quantity is 1 "item" conceptually
      additionalValue, // pass the full value to add
      excludeCartItemId
    );

    if (!limitCheck.valid) {
      return badRequest(res, limitCheck.error);
    }

    if (existingItem) {

      const newQuantity = existingItem.quantity + parsedQuantity;
      
      // Check max quantity per product limit
      if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_PRODUCT) {
        return badRequest(res, `Cannot add more than ${CART_LIMITS.MAX_QUANTITY_PER_PRODUCT} units of the same product`);
      }

      await updateCartItemQuantity(existingItem.cart_item_id, newQuantity, userId);

    } else {
      
      // Check max quantity per product limit for new item
      if (parsedQuantity > CART_LIMITS.MAX_QUANTITY_PER_PRODUCT) {
        return badRequest(res, `Cannot add more than ${CART_LIMITS.MAX_QUANTITY_PER_PRODUCT} units of the same product`);
      }

      await insertCartItem({

        cartId: req.cart.cart_id,

        productId: parsedProductId,

        quantity: parsedQuantity,

        price: itemPrice,

        productPortionId: finalPortionId,

        modifierId: parsedModifierId,

        userId

      });

    }



    const items = await getCartItemsWithOffer(req.cart.cart_id);

    const response = await buildCartResponse(req.cart.cart_id, items, null, req.user.id);

    return created(res, "Item added to cart", response);

  } catch (err) {

    console.error("Error in addItemToCart:", err);

    return serverError(res, "Internal server error");

  }

}



/**

 * Update quantity for a specific cart item (0 = remove)

 * Requires authentication (userId from JWT token)

 * 

 * PATCH /api/cart/items/:cartItemId

 * Headers: Authorization: Bearer <token>

 * Body: { quantity }

 */

async function updateCartItem(req, res) {

  try {

    // User ID comes from JWT token (authMiddleware)
    const userId = req.user.id;

    // Cart and cartItem are attached by middleware
    const cartItem = req.cartItem;

    const { quantity } = req.body;



    const parsedQuantity = parsePositiveInt(quantity);



    if (parsedQuantity === null) {

      return badRequest(res, "Invalid quantity");

    }



    // Cart item ownership is validated by middleware
    const cartItemId = req.cartItem.cart_item_id;



    if (parsedQuantity === 0) {

      await deleteCartItem(cartItemId, userId);

    } else {
      // Check max quantity per product limit
      if (parsedQuantity > CART_LIMITS.MAX_QUANTITY_PER_PRODUCT) {
        return badRequest(res, `Cannot add more than ${CART_LIMITS.MAX_QUANTITY_PER_PRODUCT} units of the same product`);
      }
      
      // Validate cart limits for quantity update
      const currentItem = req.cartItem;
      const quantityDiff = parsedQuantity - currentItem.quantity;
      
      if (quantityDiff > 0) {
        // Calculate the additional value being added
        const additionalValue = quantityDiff * Number(currentItem.effective_price);
        
        const limitCheck = await validateCartLimits(
          req.cart.cart_id,
          quantityDiff,
          additionalValue,
          cartItemId
        );

        if (!limitCheck.valid) {
          return badRequest(res, limitCheck.error);
        }
      }

      await updateCartItemQuantity(cartItemId, parsedQuantity, userId);

    }



    const updatedItems = await getCartItemsWithOffer(req.cart.cart_id);

    const response = await buildCartResponse(req.cart.cart_id, updatedItems, null, userId);

    return ok(res, "Cart item updated", response);

  } catch (err) {

    console.error("Error in updateCartItem:", err);

    return serverError(res, "Internal server error");

  }

}



/**

 * Remove a cart item

 * Requires authentication (userId from JWT token)

 * 

 * DELETE /api/cart/items/:cartItemId

 * Headers: Authorization: Bearer <token>

 */

async function removeCartItem(req, res) {
  try {
    // User ID comes from JWT token (authMiddleware)
    const userId = req.user.id;
    // Cart item ownership is validated by middleware
    const cartItemId = req.cartItem.cart_item_id;
    console.log("removeCartItem - cartItemId:", cartItemId, "userId:", userId);

    await deleteCartItem(cartItemId, userId);

    const updatedItems = await getCartItemsWithOffer(req.cart.cart_id);
    console.log("Updated items count:", updatedItems?.length || 0);

    // If cart is empty, return empty cart response
    if (!updatedItems || updatedItems.length === 0) {
      return ok(res, "Cart item removed", {
        cartId: req.cart.cart_id,
        items: [],
        subtotal: 0,
        tax: 0,
        itemDiscount: 0,
        cartDiscount: 0,
        discount: 0,
        total: 0,
        appliedCartOffer: null,
        address: null
      });
    }

    const response = await buildCartResponse(req.cart.cart_id, updatedItems, null, userId);

    return ok(res, "Cart item removed", response);
  } catch (err) {
    console.error("Error in removeCartItem:", err);
    console.error("Error stack:", err.stack);
    return serverError(res, "Internal server error");
  }
}



/**

 * Apply offer to cart (cart-level offer)

 * POST /api/cart/offer

 * Headers: Authorization: Bearer <token>

 * Body: { offer_id }

 */

async function applyCartOffer(req, res) {

  try {

    const userId = req.user.id;

    const cartId = req.cart.cart_id;

    const { offer_id, offerId } = req.body;

    const offerIdFinal = offer_id || offerId;

    if (!offerIdFinal) {

      return badRequest(res, "offer_id is required");

    }

    const parsedOfferId = parsePositiveInt(offerIdFinal);

    if (!parsedOfferId) {

      return badRequest(res, "Invalid offer_id");

    }



    // Get cart items to calculate subtotal

    const items = await getCartItemsWithOffer(cartId);

    const subtotal = items.reduce((sum, item) => sum + Number(item.effective_price) * item.quantity, 0);



    // Get offer details to validate
    const [offerDetails] = await pool.query(
      `SELECT * FROM offer_master WHERE offer_id = ? AND is_active = 1 AND is_deleted = 0`,
      [parsedOfferId]
    );

    if (!offerDetails.length) {
      return badRequest(res, "Offer not found or not active");
    }

    const offer = offerDetails[0];

    // Check if offer is within valid date/time range
    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);

    if (now < startDate || now > endDate) {
      return badRequest(res, "Offer is not currently valid");
    }

    // Check time-based offer
    if (offer.start_time && offer.end_time) {
      const currentTime = now.toTimeString().slice(0, 5);
      if (currentTime < offer.start_time || currentTime > offer.end_time) {
        return badRequest(res, "Offer is not valid at this time");
      }
    }



    // Check minimum purchase amount
    if (offer.min_purchase_amount && subtotal < offer.min_purchase_amount) {
      return badRequest(res, `Minimum purchase amount is ${offer.min_purchase_amount}`);
    }

    // Check usage limit
    if (offer.usage_limit_per_user) {
      const usageCount = await getOfferUsageCount(parsedOfferId, userId);
      if (usageCount >= offer.usage_limit_per_user) {
        return badRequest(res, "Offer usage limit exceeded");
      }
    }

    // Check if offer is applicable to cart items
    if (offer.offer_type === 'category_discount' || offer.offer_type === 'product_discount') {
      // Get applicable offers for cart
      const applicableOffers = await getApplicableCartOffers(cartId);
      const isApplicable = applicableOffers.some(o => o.offer_id === parsedOfferId);

      if (!isApplicable) {
        return badRequest(res, "Offer not applicable to cart items");
      }
    }



    // Apply offer to cart

    await applyOfferToCart(cartId, parsedOfferId);



    // Get updated cart with offer details

    const updatedCartData = await getCartWithOffer(cartId);

    const updatedCart = updatedCartData[0];



    const updatedItems = await getCartItemsWithOffer(cartId);

    const cartOfferObj = updatedCart.offer_id ? {

      offer_id: updatedCart.offer_id,

      offer_name: updatedCart.offer_name,

      offer_type: updatedCart.offer_type,

      discount_type: updatedCart.discount_type,

      discount_value: updatedCart.discount_value,

      maximum_discount_amount: updatedCart.maximum_discount_amount,

      min_purchase_amount: updatedCart.min_purchase_amount,

      usage_limit_per_user: updatedCart.usage_limit_per_user

    } : null;



    const response = await buildCartResponse(cartId, updatedItems, cartOfferObj, req.user.id);

    return ok(res, "Offer applied to cart successfully", response);

  } catch (err) {

    console.error("Error in applyCartOffer:", err);

    return serverError(res, "Internal server error");

  }

}



/**

 * Remove offer from cart

 * DELETE /api/cart/offer

 * Headers: Authorization: Bearer <token>

 */

async function removeCartOffer(req, res) {

  try {

    const cartId = req.cart.cart_id;



    await removeOfferFromCart(cartId);



    const items = await getCartItemsWithOffer(cartId);

    const response = await buildCartResponse(cartId, items, null, req.user.id);

    return ok(res, "Offer removed from cart successfully", response);

  } catch (err) {

    console.error("Error in removeCartOffer:", err);

    return serverError(res, "Internal server error");

  }

}



/**

 * Apply offer to cart item (product-level offer)

 * POST /api/cart/items/:cartItemId/offer

 * Headers: Authorization: Bearer <token>

 * Body: { offer_id }

 */

async function applyCartItemOffer(req, res) {

  try {

    const cartItemId = req.cartItem.cart_item_id;

    const { offer_id, offerId } = req.body;

    const offerIdFinal = offer_id || offerId;

    if (!offerIdFinal) {

      return badRequest(res, "offer_id is required");

    }

    const parsedOfferId = parsePositiveInt(offerIdFinal);

    if (!parsedOfferId) {

      return badRequest(res, "Invalid offer_id");

    }

    // Get offer details to validate
    const [offerDetails] = await pool.query(
      `SELECT * FROM offer_master WHERE offer_id = ? AND is_active = 1 AND is_deleted = 0`,
      [parsedOfferId]
    );

    if (!offerDetails.length) {
      return badRequest(res, "Offer not found or not active");
    }

    const offer = offerDetails[0];

    // Check if offer is within valid date/time range
    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);

    if (now < startDate || now > endDate) {
      return badRequest(res, "Offer is not currently valid");
    }

    // Check time-based offer
    if (offer.start_time && offer.end_time) {
      const currentTime = now.toTimeString().slice(0, 5);
      if (currentTime < offer.start_time || currentTime > offer.end_time) {
        return badRequest(res, "Offer is not valid at this time");
      }
    }

    // Check if offer is applicable to this cart item
    const cartItem = req.cartItem;
    if (offer.offer_type === 'category_discount' || offer.offer_type === 'product_discount') {
      // Get applicable offers for this specific product
      const applicableOffers = await getApplicableOffersForProduct(cartItem.product_id);
      const isApplicable = applicableOffers.some(o => o.offer_id === parsedOfferId);

      if (!isApplicable) {
        return badRequest(res, "Offer not applicable to this product");
      }
    }

    // Apply offer to cart item

    await applyOfferToCartItem(cartItemId, parsedOfferId);



    const items = await getCartItemsWithOffer(req.cart.cart_id);

    const response = await buildCartResponse(req.cart.cart_id, items, null, req.user.id);

    return ok(res, "Offer applied to cart item successfully", response);

  } catch (err) {

    console.error("Error in applyCartItemOffer:", err);

    return serverError(res, "Internal server error");

  }

}



/**

 * Remove offer from cart item

 * DELETE /api/cart/items/:cartItemId/offer

 * Headers: Authorization: Bearer <token>

 */

async function removeCartItemOffer(req, res) {

  try {

    const cartItemId = req.cartItem.cart_item_id;



    await removeOfferFromCartItem(cartItemId);



    const items = await getCartItemsWithOffer(req.cart.cart_id);

    const response = await buildCartResponse(req.cart.cart_id, items, null, req.user.id);

    return ok(res, "Offer removed from cart item successfully", response);

  } catch (err) {

    console.error("Error in removeCartItemOffer:", err);

    return serverError(res, "Internal server error");

  }

}



/**

 * Get applicable offers for current cart

 * GET /api/cart/offers

 * Headers: Authorization: Bearer <token>

 */

async function getApplicableOffers(req, res) {

  try {

    const cartId = req.cart.cart_id;



    // Get cart items to find products

    const items = await getCartItemsWithOffer(cartId);

    // Get unique product IDs

    const productIds = [...new Set(items.map(item => item.product_id))];



    // Get applicable offers for each product

    const productOffers = await Promise.all(

      productIds.map(productId => getApplicableOffersForProduct(productId))

    );

    // Add type field to product offers for frontend identification
    const allProductOffers = productOffers.flat().map(offer => ({
      ...offer,
      type: 'product'
    }));



    // Get applicable cart-level offers

    const cartOffersRaw = await getApplicableCartOffers();
    // Add type field to cart offers for frontend identification
    const cartOffers = cartOffersRaw.map(offer => ({
      ...offer,
      type: 'cart'
    }));



    return ok(res, "Applicable offers fetched successfully", {

      cartOffers,

      productOffers: allProductOffers

    });

  } catch (err) {

    console.error("Error in getApplicableOffers:", err);

    return serverError(res, "Internal server error");

  }

}

export { getCart, addItemToCart, updateCartItem, removeCartItem, applyCartOffer, removeCartOffer, applyCartItemOffer, removeCartItemOffer, getApplicableOffers };
