// Modifier Routes - API endpoints for modifier operations

import express from "express";
import { validate } from "../middlewares/Validations.middleware.js";

// Import validation schemas
import {
  createModifierSchema,
  updateModifierSchema,
  deleteModifierSchema,
  createModifierPortionSchema,
  updateModifierPortionSchema,
  deleteModifierPortionSchema,
} from "../validations/modifier.validation.js";

// Import controllers
import {
  getAllModifiersController,
  getModifierByIdController,
  createModifierController,
  updateModifierController,
  deleteModifierController,
  getAllModifierPortionsController,
  createModifierPortionController,
  updateModifierPortionController,
  deleteModifierPortionController,
} from "../controllers/modifier.controller.js";

const modifierRouter = express.Router();

// ============================================================================
// MODIFIER MASTER ROUTES
// ============================================================================

// GET /api/modifiers - Get all modifiers
modifierRouter.get("/", getAllModifiersController);

// GET /api/modifiers/:id - Get single modifier
modifierRouter.get("/:id", getModifierByIdController);

// POST /api/modifiers - Create new modifier
modifierRouter.post(
  "/",
  validate(createModifierSchema),
  createModifierController,
);

// PUT /api/modifiers/:id - Update modifier
modifierRouter.put(
  "/:id",
  validate(updateModifierSchema),
  updateModifierController,
);

// DELETE /api/modifiers/:id - Delete modifier
modifierRouter.delete(
  "/:id",
  validate(deleteModifierSchema),
  deleteModifierController,
);

// ============================================================================
// MODIFIER PORTION ROUTES
// ============================================================================

// GET /api/modifiers/:modifier_id/portions - Get portions for a modifier
modifierRouter.get("/:modifier_id/portions", getAllModifierPortionsController);

// POST /api/modifiers/portions - Link modifier to portion
modifierRouter.post(
  "/portions",
  validate(createModifierPortionSchema),
  createModifierPortionController,
);

// PUT /api/modifiers/portions/:id - Update modifier portion
modifierRouter.put(
  "/portions/:id",
  validate(updateModifierPortionSchema),
  updateModifierPortionController,
);

// DELETE /api/modifiers/portions/:id - Delete modifier portion
modifierRouter.delete(
  "/portions/:id",
  validate(deleteModifierPortionSchema),
  deleteModifierPortionController,
);

export default modifierRouter;
