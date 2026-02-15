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

const router = express.Router();

/* =========================
  Admin protected routes
========================= */
// Post products
router.post(
  '/',
  validate(createProductSchema),
  createProduct
);
// Delete produts
router.delete("/:id", deleteProduct);
// Update Product
// router.put('/products/:id', auth, productController.updateProduct); //auth error to be solve
router.put(
  '/:id',
  validate(updateProductSchema),
  updateProduct
); //auth error to be solve
// Update Product status
// router.patch('/products/:id/status', auth, productController.updateProductStatus);
router.patch('/:id/status', updateProductStatus);

/* =========================
  Public routes
========================= */
router.get('/', getAllProducts);
router.get('/:id', getProductById);

export default router;