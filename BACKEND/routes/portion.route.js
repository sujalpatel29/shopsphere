import express from "express";

import {
  createPortionController,
  getAllPortionController,
  getPortionByIdController,
  updatePortionController,
  deletePortionController,
  toggleActivePortionController,
//   this is for product_portion
  createProductPortionController,
  getProductPortionsController,
  getProductPortionByIdController,
  getAllProductPortionsController,
  updateProductPortionController,
  toggleActiveProductPortionController,
  deleteProductPortionController,
} from "../controllers/portion.controller.js";

import {
  portionCreateSchema,
  portionUpdateSchema,
  portionIdParamSchema,
  productIdParamSchema,
  productPortionIdParamSchema,
  productPortionCreateSchema,
  productPortionUpdateSchema,
  validateBody,
  validateParams,
} from "../validations/portion.validator.js";
import {auth, adminOnly} from '../middlewares/auth.middleware.js'; // Uncomment when you have auth

const portionRouter = express.Router();

// Portion Master API Routes

// Create new portion
portionRouter.post(
  "/createPortion",
  auth,
  adminOnly,
  validateBody(portionCreateSchema),
  createPortionController.createPortion,
); 

// Retrieve all portions
portionRouter.get("/getAllPortion",  auth,
  adminOnly, getAllPortionController); 

// Get portion by ID
portionRouter.get(
  "/getPortionById/:portion_id",
  auth,
  adminOnly,
  validateParams(portionIdParamSchema),
  getPortionByIdController,
); 

// Update portion details
portionRouter.put(
  "/updatePortion/:portion_id",
  auth,
  adminOnly,
  validateParams(portionIdParamSchema),
  validateBody(portionUpdateSchema),
  updatePortionController,
); 

//  Toggle portion active status
portionRouter.patch(
  "/toggleActivePortion/:portion_id",
  auth,
  adminOnly,
  validateParams(portionIdParamSchema),
  toggleActivePortionController,
); 

// Soft delete portion
portionRouter.delete(
  "/deletePortion/:portion_id",
  auth,
  adminOnly,
  validateParams(portionIdParamSchema),
  deletePortionController,
); 



// Product-Portion Association Routes


// Create product portion
portionRouter.post(
  "/createProductPortion",
  auth,
  adminOnly,
  validateBody(productPortionCreateSchema),
  createProductPortionController,
);

// Get all product portions (admin)
portionRouter.get("/getAllProductPortions", auth,
  adminOnly, getAllProductPortionsController);

// Get all portions of a specific product
portionRouter.get(
  "/getProductPortions/:product_id",
  validateParams(productIdParamSchema),
  getProductPortionsController,
);

// Get single product portion by id
portionRouter.get(
  "/getProductPortionById/:product_portion_id",
  validateParams(productPortionIdParamSchema),
  getProductPortionByIdController,
);

// Update product portion
portionRouter.put(
  "/updateProductPortion/:product_portion_id",
  auth,
  adminOnly,
  validateParams(productPortionIdParamSchema),
  validateBody(productPortionUpdateSchema),
  updateProductPortionController,
);

// Toggle active status
portionRouter.patch(
  "/toggleActiveProductPortion/:product_portion_id",
  auth,
  adminOnly,
  validateParams(productPortionIdParamSchema),
  toggleActiveProductPortionController,
);

// Soft delete product portion
portionRouter.delete(
  "/deleteProductPortion/:product_portion_id",
  auth,
  adminOnly,
  validateParams(productPortionIdParamSchema),
  deleteProductPortionController,
);

export default portionRouter;
