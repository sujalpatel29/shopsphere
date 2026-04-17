import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { adminOrVerifiedSeller, verifyProductOwnership } from "../middlewares/seller.middleware.js";
import { validate } from "../middlewares/Validations.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";
import {
  deleteProductImageController,
  getProductImagesController,
  getVariantImageController,
  setPrimaryProductImageController,
  updateProductImageController,
  uploadProductImageController,
} from "../controllers/productImage.controller.js";
import {
  imageIdParamSchema,
  productIdParamSchema,
  updateProductImageSchema,
  uploadProductImageSchema,
  variantQuerySchema,
} from "../validations/productImage.validation.js";

const productImageRouter = express.Router();

// Upload image and save metadata to product_images.
productImageRouter.post(
  "/upload",
  auth,
  adminOrVerifiedSeller,
  verifyProductOwnership,
  uploadSingleImage("image"),
  validate(uploadProductImageSchema),
  uploadProductImageController,
);

// Resolve image by fallback priority: VARIANT -> PORTION -> MODIFIER -> PRODUCT.
productImageRouter.get(
  "/variant/:product_id",
  validate(productIdParamSchema, "params"),
  validate(variantQuerySchema, "query"),
  getVariantImageController,
);

// Fetch all images for a product.
productImageRouter.get(
  "/:product_id",
  validate(productIdParamSchema, "params"),
  getProductImagesController,
);

// Make one image primary for its product.
productImageRouter.patch(
  "/:image_id/primary",
  auth,
  adminOrVerifiedSeller,
  verifyProductOwnership,
  validate(imageIdParamSchema, "params"),
  setPrimaryProductImageController,
);

// Update main image fields and optionally replace file.
productImageRouter.patch(
  "/update/:image_id",
  auth,
  adminOrVerifiedSeller,
  adminOrVerifiedSeller,
  uploadSingleImage("image"),
  validate(imageIdParamSchema, "params"),
  validate(updateProductImageSchema),
  updateProductImageController,
);

// Delete image from cloud and soft-delete in DB.
productImageRouter.delete(
  "/delete/:image_id",
  auth,
  adminOrVerifiedSeller,
  adminOrVerifiedSeller,
  validate(imageIdParamSchema, "params"),
  deleteProductImageController,
);

export default productImageRouter;

