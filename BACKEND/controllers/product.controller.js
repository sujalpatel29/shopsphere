import db from "../configs/db.js";
import Product, { findBestSellers } from "../models/product.model.js";
import {
  ok,
  created,
  badRequest,
  notFound,
  forbidden,
  serverError,
} from "../utils/apiResponse.js";
import { getAuthenticatedUserId } from "../middlewares/seller.middleware.js";

const isSellerRequest = (req) => req.user?.role === "seller";
const isAdminRequest = (req) => req.user?.role === "admin";

const ensureSellerOwnsProduct = async (req, productId) => {
  if (!isSellerRequest(req)) {
    return true;
  }

  const sellerId = getAuthenticatedUserId(req);
  const product = await Product.findSellerProductById(productId, sellerId);
  return Boolean(product);
};

const findProductOrNull = async (productId) => {
  const [rows] = await Product.findById(productId);
  return rows[0] || null;
};

export const createProduct = async (req, res) => {
  const conn = await db.getConnection();
  const userId = getAuthenticatedUserId(req);

  try {
    await conn.beginTransaction();

    // Validate category existence
    if (req.body.category_id) {
      const exists = await Product.checkCategoryExists(
        req.body.category_id,
        conn,
      );

      if (!exists) {
        await conn.rollback();
        return res.status(400).json({
          message: "Invalid category_id",
        });
      }
    }
    // Insert product
    const [result] = await Product.create(
      {
        ...req.body,
        seller_id: isSellerRequest(req) ? userId : null,
        created_by: userId,
      },
      conn,
    );

    const productId = result.insertId;

    // Handle category hierarchy
    if (req.body.category_id) {
      const [rows] = await Product.getCategoryWithParents(
        req.body.category_id,
        conn,
      );

      const categoryIds = rows.map((r) => r.category_id);

      await Product.insertProductCategories(
        productId,
        categoryIds,
        userId,
        conn,
      );
    }

    await conn.commit();

    return created(res, "Product created successfully", {
      product_id: productId,
    });
  } catch (err) {
    await conn.rollback();
    return serverError(res, err.message);
  } finally {
    conn.release();
  }
};

//  Soft Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getAuthenticatedUserId(req);

    const existingProduct = await findProductOrNull(id);
    if (!existingProduct) {
      return notFound(res, "Product not found");
    }

    if (isAdminRequest(req) && existingProduct.seller_id) {
      return forbidden(
        res,
        "Admin cannot delete seller-owned products. Use moderation controls instead.",
      );
    }

    if (!(await ensureSellerOwnsProduct(req, id))) {
      return notFound(res, "Product not found");
    }

    const [result] = await Product.softDelete(id, userId);

    if (result.affectedRows === 0) {
      return notFound(res, "Product not found or already deleted");
    }

    return ok(res, "Product deleted successfully");
  } catch (err) {
    return serverError(res, err.message);
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const filters = {
      category_id: req.query.category_id
        ? Number(req.query.category_id)
        : undefined,
      min_price: req.query.min_price ? Number(req.query.min_price) : undefined,
      max_price: req.query.max_price ? Number(req.query.max_price) : undefined,
      search: req.query.search,
      is_active:
        req.query.is_active !== undefined
          ? Number(req.query.is_active)
          : undefined,
      seller_id: req.query.seller_id ? Number(req.query.seller_id) : undefined,
    };

    if (isSellerRequest(req)) {
      filters.seller_id = getAuthenticatedUserId(req);
    }

    // Pagination parsing
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    // Sorting
    const sortField = req.query.sortField || null;
    const sortOrder = req.query.sortOrder || "asc";
    const sort = req.query.sort || null;

    const { total, data, totalAll, totalActive } = await Product.findAll(
      filters,
      { limit, offset, sortField, sortOrder, sort }
    );

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      stats: {
        totalAll: Number(totalAll),
        totalActive: Number(totalActive),
      },
      data,
    });
  } catch (err) {
    return serverError(res, err.message);
  }
};

// Get Product By ID
export const getProductById = async (req, res) => {
  try {
    const [rows] = await Product.findById(req.params.id);

    if (rows.length === 0) {
      return notFound(res, "Product not found");
    }

    return ok(res, "Product fetched successfully", rows[0]);
  } catch (err) {
    return serverError(res, err.message);
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const existingProduct = await findProductOrNull(req.params.id);
    if (!existingProduct) {
      return notFound(res, "Product not found");
    }

    if (isAdminRequest(req) && existingProduct.seller_id) {
      return forbidden(
        res,
        "Admin cannot edit seller-owned product details. Seller controls catalog content.",
      );
    }

    if (!(await ensureSellerOwnsProduct(req, req.params.id))) {
      return notFound(res, "Product not found");
    }

    // Fetch existing product to detect category change
    const [existingRows] = await Product.findById(req.params.id);

    if (existingRows.length === 0) {
      return notFound(res, "Product not found");
    }

    const existingRowProduct = existingRows[0];

    // If category_id not provided or unchanged, do a simple update
    if (
      !Object.prototype.hasOwnProperty.call(req.body, "category_id") ||
      Number(req.body.category_id) === Number(existingRowProduct.category_id)
    ) {
      const [result] = await Product.update(req.params.id, {
        ...req.body,
        updated_by: userId,
      });

      if (!result || result.affectedRows === 0) {
        return notFound(res, "Product not found or already deleted");
      }

      return ok(res, "Product updated successfully");
    }

    // Category changed: validate and perform transactional update
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      // Validate new category exists
      const newCategoryId = req.body.category_id;
      const categoryExists = await Product.checkCategoryExists(
        newCategoryId,
        conn,
      );

      if (!categoryExists) {
        await conn.rollback();
        return notFound(res, "Category not found");
      }

      // Update product row (preserve updated_by)
      const [updateResult] = await Product.update(
        req.params.id,
        {
          ...req.body,
          updated_by: userId,
        },
        conn,
      );

      if (!updateResult || updateResult.affectedRows === 0) {
        await conn.rollback();
        return notFound(res, "Product not found or already deleted");
      }

      // Remove old product_categories rows
      await conn.execute(
        `DELETE FROM product_categories WHERE product_id = ?`,
        [req.params.id],
      );

      // Build ancestor chain and insert new product_categories
      const [rows] = await Product.getCategoryWithParents(newCategoryId, conn);
      const categoryIds = rows.map((r) => r.category_id);

      await Product.insertProductCategories(
        req.params.id,
        categoryIds,
        userId,
        conn,
      );

      await conn.commit();

      return ok(res, "Product updated successfully");
    } catch (err) {
      await conn.rollback();
      return serverError(res, err.message);
    } finally {
      conn.release();
    }
  } catch (err) {
    return serverError(res, err.message);
  }
};

// Update Product Status

export const updateProductStatus = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!(await ensureSellerOwnsProduct(req, req.params.id))) {
      return notFound(res, "Product not found");
    }

    const [result] = await Product.updateStatus(
      req.params.id,
      req.body.is_active,
      userId,
    );
    if (result.affectedRows === 0) {
      return notFound(res, "Product not found or already deleted");
    }

    return ok(res, "Product updated successfully");
  } catch (err) {
    return serverError(res, err.message);
  }
};

// Get Best Sellers
export const getBestSellers = async (req, res) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 8);
    const [rows] = await findBestSellers(limit);
    return ok(res, "Best sellers fetched successfully", {
      count: rows.length,
      items: rows,
    });
  } catch (err) {
    return serverError(res, err.message);
  }
};
