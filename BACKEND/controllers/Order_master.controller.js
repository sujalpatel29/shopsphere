import {
  getCart,
  getCompareProductCategory,
  getUserAddress,
  insertValue,
  getAllOrder,
  getPortionPrice,
  getPortionValue,
  getOfferOnCart,
  getOfferItem,
  getProducts,
  getRootCategoryId,
  getModifierValue,
  getOfferOnId,
  getOfferDetails,
  updateOrderStatus,
  setOrderDeleted,
  getAllOrdersAdmin as modelGetAllOrdersAdmin,
  getAllItemsByCountAdmin as modelGetAllItemsByCountAdmin,
  getAllItemsAdmin as modelGetAllItemsAdmin,
  findAllOrdersAdmin,
  getOrderDetailAdmin as modelGetOrderDetail,
  updatePaymentStatusAdmin as modelUpdatePaymentStatus,
} from "../models/Order_master.model.js";

import {
  insertQuery
} from "../models/Order_items.model.js";
import { badRequest, notFound, ok, serverError, created } from "../utils/apiResponse.js";

// Create a new order from user's cart with tax, discounts, and shipping calculations
export const Order_master = async (req, res) => {
  const user_id = req.user.id;

  try {
    // Fetch user's cart items and product details
    const cart = await getCart(user_id)
    const productsIds = cart.map(item => item.product_id)
    const products = await getProducts(productsIds)
    const portionIds = cart.map(item => item.product_portion_id)
    let price = [];
    for (let i = 0; i < portionIds.length; i++) {
      if (portionIds[i] == 0 || portionIds[i] == null) {
        price.push(Number(products[i].price));
        continue;
      }
      const productId = productsIds[i];
      const portionId = portionIds[i];
      const portionPrice = await getPortionPrice(productId, portionId)
      price.push(Number(portionPrice[0].price))
    }
    const totalPrice = price.reduce((sum, val) => sum + val, 0);

    // Get product categories for tax calculation
    const rootCategoryEntries = await Promise.all(
      products.map(async (t) => {
        const rootId = await findRootCategory(t.category_id);
        return [t.product_id, rootId];
      })
    );
    const rootCategoryMap = Object.fromEntries(rootCategoryEntries);

    // Calculate tax for each item based on root category
    const taxAmountArray = cart.map((item, index) => {
      const categoryId = rootCategoryMap[item.product_id];
      const taxPercent = getTaxPercent(categoryId);

      return (price[index] * taxPercent) / 100;
    });

    const totalTax = taxAmountArray.reduce((sum, value) => sum + value, 0);
    let totalDisCountArray = [];
    let totalDisCount = 0;
    let offer_id = null;

    /* -------- CART OFFER -------- */
    const offerOnCart = await getOfferOnCart(user_id);

    offer_id = offerOnCart[0]?.offer_id || null;
    const cart_id = cart[0]?.cart_id;

    if (offer_id == null) {

      /* -------- ITEM OFFER -------- */
      const offerOnItem = await getOfferItem(cart_id);

      const item = offerOnItem.find(obj => obj.offer_id !== null);
      const firstOfferId = item ? item.offer_id : null;
      let used = false;

      const updatedArray = await Promise.all(offerOnItem.map(async obj => {
        if (obj.offer_id === firstOfferId && !used && firstOfferId !== null) {
          used = true;
          return { ...obj, offer_id: await getOfferOnId(firstOfferId) };
        }
        return { ...obj, offer_id: null };
      }));

      totalDisCountArray = updatedArray;
      offer_id = firstOfferId;
    }
    /* ------ APPLY OFFER -------- */



    const findOffer = await getOfferDetails(offer_id);

    if (findOffer.length > 0) {
      if (findOffer[0].discount_type === "percentage") {
        totalDisCount = (totalPrice * Number(findOffer[0].discount_value)) / 100;
      }

      if (findOffer[0].discount_type === "fixed_amount") {
        totalDisCount = Number(findOffer[0].discount_value);
      }
    }

    const safe = (v) => (isNaN(v) || v === null || v === undefined ? 0 : Number(v));
    // Calculate final amount and apply shipping charges
    const final_Amount =
      safe(totalPrice) +
      safe(totalTax) -
      safe(totalDisCount);
    let shipping_amount = 50;
    if (final_Amount > 500) shipping_amount = 0
    // Get user's address and set order status
    const address_id = await getUserAddress(user_id);
    const order_status = "pending"
    const payment_status = "processing"

    // Prepare order details for insertion
    const order_num = "ORD";

    const values = [
      order_num,
      user_id,
      address_id,
      safe(totalPrice),
      safe(totalTax),
      safe(shipping_amount),
      safe(totalDisCount),
      safe(final_Amount),
      order_status,
      payment_status,
      0,
      user_id,
      user_id,
    ];
    // Insert order master record and create order items
    const insert = await insertValue(values);
    const orderId = insert.insertId;
    await postOrderItems(user_id, orderId, price, taxAmountArray, totalDisCountArray, cart)
    return created(res, "Order created successfully", insert)
  } catch (err) {
    console.log(err)
    return serverError(res)
  }
}

// Retrieve all orders for a user
export const AllOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await getAllOrder(userId);
    if (orders.length == 0) {
      return notFound(res, "Orders not found")
    }
    return ok(res, "Orders found Successfully", orders)
  } catch (error) {
    return serverError(res)
  }
}

// Retrieve a specific order by order ID


// Create order item records for each product in the order
export const postOrderItems = async (userId, orderId, price, taxAmountArray, totalDisCountArray, cart) => {
  const cart_id = cart[0]?.cart_id;
  // Extract product IDs from cart
  const productIds = cart.map((item) => item.product_id);
  let offer_id = null;
  offer_id = totalDisCountArray[0]?.offer_id || null;

  // Fetch primary category for each product
  const productCategories = await getCompareProductCategory(productIds);
  const categoryIds = productCategories.map((item) => item.category_id);
  const modifierIds = cart.map(item => item.modifier_id)
  const portionIds = cart.map(item => item.product_portion_id)
  const portionRows = await getPortionValue(portionIds)
  const modifierRows = await getModifierValue(modifierIds)
  const quantities = cart.map(item => item.quantity)
  const portionMap = Object.fromEntries(
    portionRows.map(p => [p.portion_id, p.portion_value])
  );

  const modifierMap = Object.fromEntries(
    modifierRows.map(m => [m.modifier_id, m.modifier_value])
  );

  // Fetch product names
  const values = [];
  const products = await getProducts(productIds);
  // Create map of product IDs to names
  const productMap = Object.fromEntries(
    products.map(p => [p.product_id, p.name])
  );

  if (!totalDisCountArray || totalDisCountArray.length === 0) {
    totalDisCountArray = new Array(cart.length).fill(0);
  }
  console.log(totalDisCountArray)
  // Build order item records with calculated totals
  for (let i = 0; i < cart.length; i++) {
    // Apply shipping charges based on item price
    let shippingAmount = 100;
    if (price[i] > 100) shippingAmount = 0;
    // Calculate final total for this order item
    const p = isNaN(price[i]) ? 0 : Number(price[i]);
    const t = isNaN(taxAmountArray[i]) ? 0 : Number(taxAmountArray[i]);
    const d = Number(totalDisCountArray[i]?.offer_id) || 0;
    const finalTotal = p + t - d;


    // Prepare order item data
    const value = [
      orderId,
      productIds[i],
      portionIds[i],
      modifierIds[i],
      productMap[productIds[i]] || null,
      portionMap[portionIds[i]] || null,
      modifierMap[modifierIds[i]] || null,
      quantities[i],
      p,
      d,
      t,
      finalTotal,
      userId,
      userId
    ];
    values.push(value);
  }
  // Insert all order items into database
  await insertQuery(values, cart_id)
}

// Find root category ID for tax calculation
const findRootCategory = async (categoryId) => {
  const rows = await getRootCategoryId(categoryId);
  return rows[0]?.category_id;
};

// Get tax percentage based on root category
const getTaxPercent = (rootCategoryId) => {
  const TAX_RULES = {
    1: 18,
    27: 5
  };
  return TAX_RULES[rootCategoryId] || 0;
}
export const changeOrderStatusByAdmin = async (req, res) => {
  try {
    const latestStatus = req.body.latestStatus;
    const order_id = req.params.id;
    const rows = await updateOrderStatus(order_id, latestStatus);
    return ok(res, "order Update Successfully", rows);
  } catch (err) {
    console.error(err);
    return serverError(res);
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order_id = req.params.id;
    const rows = await setOrderDeleted(order_id);
    return ok(res, "order deleted Successfully", rows);
  } catch (err) {
    console.error(err);
    return serverError(res);
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order_id = req.params.id;
    const rows = await updateOrderStatus(order_id, "cancelled");
    return ok(res, "cancel Order Succesfully", rows);
  } catch (err) {
    console.error(err);
    return serverError(res);
  }
};

export const returnOrderByUser = async (req, res) => {
  try {
    const order_id = req.params.id;
    const rows = await updateOrderStatus(order_id, "returned");
    return ok(res, "Order return SuccessFully", rows);
  } catch (err) {
    console.error(err);
    return serverError(res);
  }
};

export const getAllOrderByAdmin = async (req, res) => {
  try {
    const rows = await modelGetAllOrdersAdmin();
    return ok(res, "all order fetched seccessfully", rows);
  } catch (err) {
    console.error(err);
    return serverError(res);
  }
};

export const getAllItemsByCountAdmin = async (req, res) => {
  try {
    const rows = await modelGetAllItemsByCountAdmin();
    return ok(res, "all item by count fetched successfully", rows);
  } catch (err) {
    console.error(err);
    return serverError(res);
  }
};

export const getAllItemsAdmin = async (req, res) => {
  try {
    const rows = await modelGetAllItemsAdmin();
    return ok(res, "all items fetched seccessfully", rows);
  } catch (err) {
    console.error(err);
    return serverError(res);
  }
};

/**
 * GET /api/order/admin/orders
 *
 * Admin endpoint: Returns paginated orders enriched with user, address, and
 * payment data. Supports search, filters, and sorting via query params.
 *
 * Query params: page, limit, search, sortField, sortOrder, order_status,
 *               payment_status, payment_method, date_from, date_to
 *
 * Response: { pagination, stats, data[] }
 */
export const getAdminOrdersPaginated = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.search) filters.search = req.query.search;
    if (req.query.order_status) filters.order_status = req.query.order_status;
    if (req.query.payment_status) filters.payment_status = req.query.payment_status;
    if (req.query.payment_method) filters.payment_method = req.query.payment_method;
    if (req.query.date_from) filters.date_from = req.query.date_from;
    if (req.query.date_to) filters.date_to = req.query.date_to;

    const pagination = {
      limit,
      offset,
      sortField: req.query.sortField || null,
      sortOrder: req.query.sortOrder || "desc",
    };

    const { total, data, stats } = await findAllOrdersAdmin(filters, pagination);

    return ok(res, "Orders fetched successfully", {
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      stats,
      data,
    });
  } catch (err) {
    console.error("getAdminOrdersPaginated error:", err);
    return serverError(res, "Failed to fetch orders");
  }
};

/**
 * GET /api/order/admin/orders/:id
 *
 * Admin endpoint: Returns a single order with full user info, shipping
 * address, order items, and payment history. Used by the order detail modal.
 */
export const getAdminOrderDetail = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (!orderId || orderId <= 0) {
      return badRequest(res, "Invalid order ID");
    }

    const order = await modelGetOrderDetail(orderId);
    if (!order) {
      return notFound(res, "Order not found");
    }

    return ok(res, "Order detail fetched successfully", order);
  } catch (err) {
    console.error("getAdminOrderDetail error:", err);
    return serverError(res, "Failed to fetch order detail");
  }
};

/**
 * PATCH /api/order/admin/orders/:id/payment-status
 *
 * Admin endpoint: Manually update the payment_status on an order.
 * Validates against allowed enum values before writing to the database.
 *
 * Body: { paymentStatus: "pending"|"processing"|"completed"|"failed"|"refunded" }
 */
export const updatePaymentStatusByAdmin = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { paymentStatus } = req.body;

    const validStatuses = ["pending", "processing", "completed", "failed", "refunded"];
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return badRequest(res, `Invalid payment status. Use: ${validStatuses.join(", ")}`);
    }

    const result = await modelUpdatePaymentStatus(orderId, paymentStatus);
    if (result.affectedRows === 0) {
      return notFound(res, "Order not found");
    }

    return ok(res, "Payment status updated successfully", { order_id: orderId, payment_status: paymentStatus });
  } catch (err) {
    console.error("updatePaymentStatusByAdmin error:", err);
    return serverError(res, "Failed to update payment status");
  }
};