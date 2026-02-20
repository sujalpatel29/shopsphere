import express from "express";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  updateProductStatus,
  getAllProducts,
  getProductById
} from "../controllers/product.controller.js";
import { validate } from "../middlewares/Validations.middleware.js";
import {
  createProductSchema,
  updateProductSchema
} from "../validations/product.validation.js";
import { auth, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Admin protected routes

// Post products
router.post(
  '/',
  auth,
  adminOnly,
  validate(createProductSchema),
  createProduct
);
// Delete product
router.delete("/:id", auth, adminOnly, deleteProduct);
// Update Product
router.put(
  '/:id',
  auth,
  adminOnly,
  validate(updateProductSchema),
  updateProduct
); 
// Update Product status
router.patch('/:id/status', auth, adminOnly, updateProductStatus);

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

export default router;