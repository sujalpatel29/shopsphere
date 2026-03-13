/**
 * @module AnalyticsModel
 * @description Database operations for admin analytics and reports.
 * Provides aggregated data for dashboard charts and statistics.
 */
import pool from "../configs/db.js";

const AnalyticsModel = {
  /**
   * Get overview statistics for dashboard
   * @returns {Promise<Object>} Overview stats
   */
  async getOverviewStats() {
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM user_master WHERE is_deleted = 0) AS total_users,
        (SELECT COUNT(*) FROM user_master WHERE is_deleted = 0 AND role = 'customer') AS total_customers,
        (SELECT COUNT(*) FROM product_master WHERE is_deleted = 0) AS total_products,
        (SELECT COUNT(*) FROM product_master WHERE is_deleted = 0 AND is_active = 1) AS active_products,
        (SELECT COUNT(*) FROM order_master WHERE is_deleted = 0) AS total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM order_master WHERE is_deleted = 0) AS total_revenue,
        (SELECT COUNT(*) FROM order_master WHERE is_deleted = 0 AND order_status = 'pending') AS pending_orders,
        (SELECT COUNT(*) FROM order_master WHERE is_deleted = 0 AND order_status = 'delivered') AS delivered_orders,
        (SELECT COUNT(*) FROM offer_master WHERE is_deleted = 0 AND is_active = 1) AS active_offers
    `);
    return stats[0];
  },

  /**
   * Get revenue data for the last N days
   * @param {number} days - Number of days to fetch
   * @returns {Promise<Array>} Daily revenue data
   */
  async getRevenueChart(days = 30) {
    const [rows] = await pool.execute(`
      SELECT 
        DATE(created_at) AS date,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(*) AS order_count
      FROM order_master
      WHERE is_deleted = 0
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);
    return rows;
  },

  /**
   * Get order status distribution
   * @returns {Promise<Array>} Order status counts
   */
  async getOrderStatusDistribution() {
    const [rows] = await pool.execute(`
      SELECT 
        order_status,
        COUNT(*) AS count
      FROM order_master
      WHERE is_deleted = 0
      GROUP BY order_status
    `);
    return rows;
  },

  /**
   * Get top selling products
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} Top products with sales data
   */
  async getTopSellingProducts(limit = 10) {
    const [rows] = await pool.execute(`
      SELECT
        pm.product_id,
        pm.name,
        pm.display_name,
        pm.price,
        COALESCE(SUM(oi.quantity), 0) AS total_sold,
        COALESCE(SUM(oi.total), 0) AS total_revenue
      FROM product_master pm
      LEFT JOIN order_items oi ON pm.product_id = oi.product_id
      WHERE pm.is_deleted = 0
      GROUP BY pm.product_id
      ORDER BY total_sold DESC
      LIMIT ${parseInt(limit)}
    `);
    return rows;
  },

  /**
   * Get category sales distribution
   * @returns {Promise<Array>} Category sales data
   */
  async getCategorySales() {
    const [rows] = await pool.execute(`
      SELECT
        cm.category_name,
        COALESCE(SUM(oi.quantity), 0) AS items_sold,
        COALESCE(SUM(oi.total), 0) AS revenue
      FROM category_master cm
      LEFT JOIN product_categories pc ON cm.category_id = pc.category_id
      LEFT JOIN order_items oi ON pc.product_id = oi.product_id
      WHERE cm.is_deleted = 0
      GROUP BY cm.category_id
      ORDER BY revenue DESC
      LIMIT 10
    `);
    return rows;
  },

  /**
   * Get payment method distribution
   * @returns {Promise<Array>} Payment method counts
   */
  async getPaymentMethodDistribution() {
    const [rows] = await pool.execute(`
      SELECT 
        payment_method,
        COUNT(*) AS count,
        COALESCE(SUM(amount), 0) AS total_amount
      FROM payment_master
      GROUP BY payment_method
    `);
    return rows;
  },

  /**
   * Get recent orders
   * @param {number} limit - Number of orders to return
   * @returns {Promise<Array>} Recent orders
   */
  async getRecentOrders(limit = 10) {
    const [rows] = await pool.execute(`
      SELECT
        om.order_id,
        om.order_number,
        om.total_amount,
        om.order_status,
        om.payment_status,
        om.created_at,
        um.name AS customer_name,
        um.email AS customer_email
      FROM order_master om
      JOIN user_master um ON om.user_id = um.user_id
      WHERE om.is_deleted = 0
      ORDER BY om.created_at DESC
      LIMIT ${parseInt(limit)}
    `);
    return rows;
  },

  /**
   * Get user registration trends
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Array>} Daily registration counts
   */
  async getUserRegistrationTrend(days = 30) {
    const [rows] = await pool.execute(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS new_users
      FROM user_master
      WHERE is_deleted = 0
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);
    return rows;
  },

  /**
   * Get offer usage statistics
   * @returns {Promise<Array>} Offer usage data
   */
  async getOfferUsageStats() {
    const [rows] = await pool.execute(`
      SELECT 
        om.offer_id,
        om.offer_name,
        om.offer_type,
        om.discount_type,
        om.discount_value,
        COUNT(ou.offer_usage_id) AS total_usage,
        COALESCE(SUM(ou.discount_amount), 0) AS total_discount_given
      FROM offer_master om
      LEFT JOIN offer_usage ou ON om.offer_id = ou.offer_id
      WHERE om.is_deleted = 0
      GROUP BY om.offer_id
      ORDER BY total_usage DESC
      LIMIT 10
    `);
    return rows;
  },

  /**
   * Get low stock products
   * @param {number} threshold - Stock threshold
   * @returns {Promise<Array>} Low stock products
   */
  async getLowStockProducts(threshold = 10) {
    const [rows] = await pool.execute(`
      SELECT 
        pm.product_id,
        pm.name,
        pm.display_name,
        pm.stock,
        pm.is_active
      FROM product_master pm
      WHERE pm.is_deleted = 0
        AND pm.stock <= ?
      ORDER BY pm.stock ASC
      LIMIT 20
    `, [threshold]);
    return rows;
  },

  /**
   * Get monthly revenue comparison (current year vs previous year)
   * @returns {Promise<Array>} Monthly revenue data
   */
  async getMonthlyRevenueComparison() {
    const [rows] = await pool.execute(`
      SELECT 
        MONTH(created_at) AS month,
        YEAR(created_at) AS year,
        COALESCE(SUM(total_amount), 0) AS revenue
      FROM order_master
      WHERE is_deleted = 0
        AND YEAR(created_at) IN (YEAR(CURDATE()), YEAR(CURDATE()) - 1)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY month ASC, year ASC
    `);
    return rows;
  },

  /**
   * Get average order value trend
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Array>} Daily average order values
   */
  async getAOVTrend(days = 30) {
    const [rows] = await pool.execute(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS order_count,
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(AVG(total_amount), 0) AS avg_order_value
      FROM order_master
      WHERE is_deleted = 0
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);
    return rows;
  }
};

export default AnalyticsModel;
