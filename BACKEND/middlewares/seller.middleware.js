import pool from "../configs/db.js";

export const getAuthenticatedUserId = (req) =>
  req?.user?.user_id ?? req?.user?.id ?? null;

export const verifyProductOwnership = async (req, res, next) => {
  if (req.user?.role === "admin") {
    return next(); // Admins bypass ownership checks
  }
  
  if (req.user?.role !== "seller") {
    return next(); // If neither, let existing auth middlewares handle it
  }

  const sellerId = getAuthenticatedUserId(req);
  let productId = req.body?.product_id || req.params?.product_id || req.query?.product_id;

  try {
    // 1. Resolve product_id from product_portion_id
    if (!productId && (req.params?.product_portion_id || req.body?.product_portion_id)) {
      const ppId = req.params?.product_portion_id || req.body?.product_portion_id;
      const [rows] = await pool.query("SELECT product_id FROM product_portion WHERE product_portion_id = ?", [ppId]);
      if (rows.length) productId = rows[0].product_id;
    }

    // 2. Resolve product_id from modifier_portion_id
    // Note: In modifier routes, update/delete passes modifier_portion_id as simply ':id'
    const modifierPortionId = req.params?.id && req.originalUrl.includes('/portions/') ? req.params.id : (req.body?.modifier_portion_id || req.params?.modifier_portion_id);
    if (!productId && modifierPortionId) {
      const [rows] = await pool.query("SELECT product_id FROM modifier_portion WHERE modifier_portion_id = ?", [modifierPortionId]);
      if (rows.length) productId = rows[0].product_id;
    }

    // 3. Resolve product_id from combination_id
    const combinationId = req.params?.id && req.originalUrl.includes('/combinations/') ? req.params.id : (req.body?.combination_id || req.params?.combination_id);
    if (!productId && combinationId) {
      const [rows] = await pool.query("SELECT product_id FROM modifier_combinations WHERE combination_id = ?", [combinationId]);
      if (rows.length) productId = rows[0].product_id;
    }

    // 4. Resolve product_id from image_id
    if (!productId && (req.params?.image_id || req.body?.image_id)) {
      const imgId = req.params?.image_id || req.body?.image_id;
      const [rows] = await pool.query("SELECT product_id FROM product_images WHERE image_id = ?", [imgId]);
      if (rows.length) productId = rows[0].product_id;
    }

    if (!productId) {
       // If no product contextual info is found, block access as a fallback security measure for sellers
       return res.status(403).json({ success: false, message: "Access denied. Cannot verify product ownership." });
    }

    const [pRows] = await pool.query("SELECT seller_id FROM product_master WHERE product_id = ? AND is_deleted = 0", [productId]);
    if (!pRows.length || Number(pRows[0].seller_id) !== Number(sellerId)) {
        return res.status(403).json({ success: false, message: "Access denied. You do not own this product." });
    }

    next();
  } catch (error) {
    console.error("verifyProductOwnership middleware error:", error);
    return res.status(500).json({ success: false, message: "Server error verifying ownership" });
  }
};

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
