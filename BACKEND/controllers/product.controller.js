import db from "../configs/db.js";
import Product from "../models/product.model.js";
import {
  ok,
  created,
  badRequest,
  notFound,
  serverError,
  paginated,
  validationError
} from "../utils/apiResponse.js";


export const createProduct = async (req, res) => {
  const conn = await db.getConnection();

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
        created_by: req.user.id,
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
        req.user.id,
        conn,
      );
    }

    await conn.commit();

    return created(res, "Product created successfully", {
      product_id: productId
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

    const [result] = await Product.softDelete(id, req.user.id);

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
      category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
      min_price: req.query.min_price ? Number(req.query.min_price) : undefined,
      max_price: req.query.max_price ? Number(req.query.max_price) : undefined,
      search: req.query.search,
      is_active: req.query.is_active !== undefined ? Number(req.query.is_active) : undefined
    };

    // Pagination parsing
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);

    const offset = (page - 1) * limit;


    const { total, data } = await Product.findAll(
      filters,
      { limit, offset }
    );

    return paginated(
      res,
      "Products fetched successfully",
      data,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    );


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
    const [result] = await Product.update(
      req.params.id, {
      ...req.body,
      updated_by: req.user.id,
    });

    if (result.affectedRows === 0) {
      return notFound(res, "Product not found or already deleted");
    }

    return ok(res, "Product updated successfully");
  } catch (err) {
    return serverError(res, err.message);
  }
};

// Update Product Status

export const updateProductStatus = async (req, res) => {
  try {
    const [result] = await Product.updateStatus(req.params.id, req.body.is_active, req.user.id);
    if (result.affectedRows === 0) {
      return notFound(res, "Product not found or already deleted");
    }

    return ok(res, "Product updated successfully");
  } catch (err) {
    return serverError(res, err.message);

  }
};
