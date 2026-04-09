import pool from "../configs/db.js";

export const getAuthenticatedUserId = (req) =>
  req?.user?.user_id ?? req?.user?.id ?? null;

export const sellerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (req.user.role !== "seller") {
    return res.status(403).json({ success: false, message: "Seller access required" });
  }
  next();
};

export const verifiedSellerOnly = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (req.user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const [rows] = await pool.query(
      "SELECT verification_status FROM seller_profiles WHERE seller_id = ?",
      [userId]
    );

    if (!rows.length || rows[0].verification_status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Seller account not verified. Please wait for admin approval."
      });
    }

    next();
  } catch (error) {
    console.error("Verified seller middleware error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminOrSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (req.user.role !== "admin" && req.user.role !== "seller") {
    return res.status(403).json({ success: false, message: "Admin or Seller access required" });
  }
  next();
};

export const adminOrVerifiedSeller = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (req.user.role === "admin") {
      return next();
    }

    if (req.user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const [rows] = await pool.query(
      "SELECT verification_status FROM seller_profiles WHERE seller_id = ?",
      [userId]
    );

    if (!rows.length || rows[0].verification_status !== "approved") {
      return res.status(403).json({ success: false, message: "Verified seller access required" });
    }

    next();
  } catch (error) {
    console.error("Admin or verified seller middleware error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSellerId = async (userId) => {
  const [rows] = await pool.query(
    "SELECT seller_profile_id FROM seller_profiles WHERE seller_id = ? AND verification_status = 'approved'",
    [userId]
  );
  return rows[0]?.seller_profile_id || null;
};

export default {
  sellerOnly,
  verifiedSellerOnly,
  adminOrSeller,
  adminOrVerifiedSeller,
  getSellerId,
  getAuthenticatedUserId,
};
