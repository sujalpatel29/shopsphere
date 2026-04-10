import * as sellerModel from "../models/seller.model.js";
import pool from "../configs/db.js";
import { ok, badRequest, notFound, serverError } from "../utils/apiResponse.js";
import { getAuthenticatedUserId } from "../middlewares/seller.middleware.js";

export const applyToBeSeller = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const {
      business_name,
      business_description,
      business_address,
      phone,
      gst_number,
      bank_account_number,
      bank_ifsc_code,
      bank_account_holder
    } = req.body;

    if (!business_name) {
      return badRequest(res, "Business name is required");
    }

    const existing = await sellerModel.isUserSeller(userId);
    if (existing) {
      return badRequest(res, "You are already a seller");
    }

    await sellerModel.createSellerProfile({
      seller_id: userId,
      business_name,
      business_description,
      business_address,
      phone,
      gst_number,
      bank_account_number,
      bank_ifsc_code,
      bank_account_holder
    });

    await sellerModel.updateUserToSeller(userId);

    return ok(res, "Seller application submitted successfully. Please wait for admin approval.", { status: "pending" });
  } catch (err) {
    console.error("Apply seller error:", err);
    return serverError(res, "Failed to apply as seller");
  }
};

export const getMySellerProfile = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const profile = await sellerModel.getSellerProfileByUserId(userId);

    if (!profile.length) {
      return notFound(res, "Seller profile not found");
    }

    return ok(res, "Seller profile fetched", profile[0]);
  } catch (err) {
    console.error("Get seller profile error:", err);
    return serverError(res, "Failed to get seller profile");
  }
};

export const updateMySellerProfile = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const data = req.body;

    delete data.verification_status;
    delete data.verified_at;
    delete data.verified_by;
    delete data.seller_id;
    delete data.seller_profile_id;

    const result = await sellerModel.updateSellerProfile(userId, data);

    return ok(res, "Seller profile updated", { affectedRows: result.affectedRows });
  } catch (err) {
    console.error("Update seller profile error:", err);
    return serverError(res, "Failed to update seller profile");
  }
};

export const getAllSellers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const sellers = await sellerModel.getAllSellers({ status, search });
    return ok(res, "Sellers fetched", sellers);
  } catch (err) {
    console.error("Get all sellers error:", err);
    return serverError(res, "Failed to get sellers");
  }
};

export const getSellerById = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const profile = await sellerModel.getSellerProfileByUserId(sellerId);

    if (!profile.length) {
      return notFound(res, "Seller not found");
    }

    return ok(res, "Seller fetched", profile[0]);
  } catch (err) {
    console.error("Get seller error:", err);
    return serverError(res, "Failed to get seller");
  }
};

export const verifySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status } = req.body;
    const adminId = getAuthenticatedUserId(req);

    if (!["approved", "rejected"].includes(status)) {
      return badRequest(res, "Invalid status. Use 'approved' or 'rejected'");
    }

    await sellerModel.verifySeller(sellerId, status, adminId);
    await sellerModel.setUserSellerStatus(sellerId, status);

    return ok(res, `Seller ${status} successfully`);
  } catch (err) {
    console.error("Verify seller error:", err);
    return serverError(res, "Failed to verify seller");
  }
};

export const blockSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { is_blocked } = req.body;

    await sellerModel.setUserSellerStatus(sellerId, is_blocked ? "blocked" : "active");

    return ok(res, `Seller ${is_blocked ? "blocked" : "unblocked"} successfully`);
  } catch (err) {
    console.error("Block seller error:", err);
    return serverError(res, "Failed to block seller");
  }
};

export const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = getAuthenticatedUserId(req);
    const profile = await sellerModel.getSellerProfileByUserId(sellerId);

    const productsQuery = `
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_products
      FROM product_master
      WHERE seller_id = ? AND is_deleted = 0
    `;
    const [productsStats] = await pool.query(productsQuery, [sellerId]);

    const ordersQuery = `
      SELECT 
        COUNT(DISTINCT oi.order_id) as total_orders,
        SUM(oi.quantity * oi.price) as total_revenue,
        SUM(oi.quantity) as total_items_sold
      FROM order_items oi
      JOIN product_master p ON p.product_id = oi.product_id
      JOIN order_master o ON o.order_id = oi.order_id
      WHERE p.seller_id = ? AND o.order_status NOT IN ('cancelled', 'refunded')
    `;
    const [orderStats] = await pool.query(ordersQuery, [sellerId]);

    const pendingOrdersQuery = `
      SELECT COUNT(DISTINCT oi.order_id) as pending_orders
      FROM order_items oi
      JOIN product_master p ON p.product_id = oi.product_id
      JOIN order_master o ON o.order_id = oi.order_id
      WHERE p.seller_id = ? AND o.order_status = 'pending'
    `;
    const [pendingStats] = await pool.query(pendingOrdersQuery, [sellerId]);

    const data = {
      verification_status: profile[0]?.verification_status || "pending",
      products: productsStats[0] || { total_products: 0, active_products: 0 },
      orders: orderStats[0] || { total_orders: 0, total_revenue: 0, total_items_sold: 0 },
      pending_orders: pendingStats[0]?.pending_orders || 0
    };

    return ok(res, "Seller analytics fetched", data);
  } catch (err) {
    console.error("Get seller analytics error:", err);
    return serverError(res, "Failed to get seller analytics");
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = getAuthenticatedUserId(req);
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const ordersQuery = `
      SELECT DISTINCT 
        o.order_id,
        o.order_number,
        o.order_status,
        o.payment_status,
        o.total_amount,
        o.created_at,
        u.name as customer_name,
        u.email as customer_email,
        COUNT(oi.order_item_id) as item_count
      FROM order_items oi
      JOIN product_master p ON p.product_id = oi.product_id
      JOIN order_master o ON o.order_id = oi.order_id
      LEFT JOIN user_master u ON u.user_id = o.user_id
      WHERE p.seller_id = ? AND o.is_deleted = 0
      GROUP BY o.order_id, o.order_number, o.order_status, o.payment_status, o.total_amount, o.created_at, u.name, u.email
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [orders] = await pool.query(ordersQuery, [sellerId, Number(limit), offset]);

    const countQuery = `
      SELECT COUNT(DISTINCT o.order_id) as total
      FROM order_items oi
      JOIN product_master p ON p.product_id = oi.product_id
      JOIN order_master o ON o.order_id = oi.order_id
      WHERE p.seller_id = ? AND o.is_deleted = 0
    `;
    const [countResult] = await pool.query(countQuery, [sellerId]);

    return ok(res, "Seller orders fetched", {
      items: orders,
      count: countResult[0]?.total || 0,
    });
  } catch (err) {
    console.error("Get seller orders error:", err);
    return serverError(res, "Failed to get seller orders");
  }
};

export const getSellerOrderDetail = async (req, res) => {
  try {
    const sellerId = getAuthenticatedUserId(req);
    const { orderId } = req.params;

    const [orders] = await pool.query(
      `
        SELECT DISTINCT
          o.order_id,
          o.order_number,
          o.order_status,
          o.payment_status,
          o.total_amount,
          o.discount_amount,
          o.tax_amount,
          o.created_at,
          CONCAT_WS(', ', ua.address_line1, ua.address_line2, ua.city, ua.state, ua.postal_code) AS shipping_address,
          u.name AS customer_name,
          u.email AS customer_email
        FROM order_master o
        JOIN order_items oi ON oi.order_id = o.order_id
        JOIN product_master p ON p.product_id = oi.product_id
        LEFT JOIN user_master u ON u.user_id = o.user_id
        LEFT JOIN user_addresses ua ON ua.address_id = o.address_id
        WHERE o.order_id = ? AND p.seller_id = ? AND o.is_deleted = 0
        LIMIT 1
      `,
      [orderId, sellerId],
    );

    if (!orders.length) {
      return notFound(res, "Order not found");
    }

    const [items] = await pool.query(
      `
        SELECT
          oi.order_item_id,
          oi.order_id,
          oi.product_id,
          oi.product_name,
          oi.portion_value,
          oi.modifier_value,
          oi.quantity,
          oi.price,
          oi.tax,
          oi.total
        FROM order_items oi
        JOIN product_master p ON p.product_id = oi.product_id
        WHERE oi.order_id = ? AND p.seller_id = ? AND oi.is_deleted = 0
        ORDER BY oi.order_item_id ASC
      `,
      [orderId, sellerId],
    );

    return ok(res, "Seller order fetched", {
      ...orders[0],
      items,
    });
  } catch (err) {
    console.error("Get seller order detail error:", err);
    return serverError(res, "Failed to get seller order detail");
  }
};
