import express from "express";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  updateProductStatus,
  getAllProducts,
  getProductById,
  getBestSellers,
} from "../controllers/product.controller.js";
import { validate } from "../middlewares/Validations.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation.js";
import { auth, adminOnly } from "../middlewares/auth.middleware.js";
import { adminOrVerifiedSeller } from "../middlewares/seller.middleware.js";

const router = express.Router();

// Admin protected routes
router.post("/", auth, adminOrVerifiedSeller, validate(createProductSchema), createProduct);
router.delete("/:id", auth, adminOrVerifiedSeller, deleteProduct);
router.put(
  "/:id",
  auth,
  adminOrVerifiedSeller,
  validate(updateProductSchema),
  updateProduct,
);
router.patch("/:id/status", auth, adminOrVerifiedSeller, updateProductStatus);

// Public routes
router.get("/bestsellers", getBestSellers);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;
