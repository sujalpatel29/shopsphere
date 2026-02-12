/**
 * Modifier Controller
 *
 * This file contains all controller functions for modifier-related API endpoints.
 * Controllers handle business logic, call model functions, and send API responses.
 *
 * Request validation is handled by middleware before reaching these controllers.
 *
 * @module controllers/modifier
 * @requires models/modifier
 * @requires utils/apiResponse
 */

import {
  getAllModifiers,
  getModifierById,
  createModifier,
  updateModifier,
  deleteModifier,
  getModifierPortions,
  createModifierPortion,
  updateModifierPortion,
  deleteModifierPortion,
} from "../models/modifier.model.js";

import {
  ok,
  created,
  badRequest,
  notFound,
  serverError,
  conflict,
} from "../utils/apiResponse.js";

// ============================================================================
// MODIFIER MASTER CONTROLLERS
// ============================================================================

/**
 * Get all active modifiers
 *
 * @route GET /api/modifiers
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Array of modifiers
 * @returns {Object} 404 - No modifiers found
 * @returns {Object} 500 - Server error
 */
export const getAllModifiersController = async (req, res) => {
  try {
    // Call the model function
    const modifiers = await getAllModifiers();

    //check if empty
    if (!modifiers || modifiers.length === 0) {
      return notFound(res, "No modifiers found");
    }

    //send success response
    return ok(res, "Modifiers fetched successfully", modifiers);
  } catch (err) {
    console.error("Get All modifiers controller error ", err);
    return serverError(res, "Internal server error");
  }
};

/**
 * Get a single modifier by ID
 *
 * @route GET /api/modifiers/:id
 * @access Public
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Modifier ID
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Modifier object
 * @returns {Object} 404 - Modifier not found
 * @returns {Object} 500 - Server error
 */
export const getModifierByIdController = async (req, res) => {
  try {
    // Get ID from URL params
    const { id } = req.params;
    //call model function
    const modifier = await getModifierById(id);

    //check if empty
    if (!modifier) {
      return notFound(res, "Modifier Not found");
    }

    //send success response
    return ok(res, "Modifier fetched successfully", modifier);
  } catch (err) {
    console.error("Get Modifier By Id controller error ", err);
    return serverError(res, "Internal server error");
  }
};

/**
 * Create a new modifier
 *
 * @route POST /api/modifiers
 * @access Public
 * @param {Object} req - Express request object
 * @param {string} req.body.modifier_name - Name of the modifier
 * @param {string} req.body.modifier_value - Value of the modifier
 * @param {number} [req.body.additional_price] - Additional price
 * @param {Object} res - Express response object
 * @returns {Object} 201 - Created modifier with ID
 * @returns {Object} 409 - Duplicate modifier
 * @returns {Object} 500 - Server error
 */
export const createModifierController = async (req, res) => {
  try {
    //Get data form body
    const { modifier_name, modifier_value, additional_price } = req.body;

    // Set default createdBy (in real app, this comes from auth token)
    const created_by = 1;

    // Call model function
    const modifier_id = await createModifier({
      modifier_name,
      modifier_value,
      additional_price,
      created_by,
    });

    //send success response
    return created(res, "Modifier created successfully", { modifier_id });
  } catch (err) {
    console.error("Create Modifier Controller error ", err);

    // Handle duplicate entry error
    if (err.code === "ER_DUP_ENTRY") {
      return conflict(res, "Modifier with this name and value already exists");
    }

    return serverError(res, "Internal server error");
  }
};

/**
 * Update an existing modifier
 *
 * @route PUT /api/modifiers/:id
 * @access Public
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Modifier ID
 * @param {string} [req.body.modifier_name] - Updated name
 * @param {string} [req.body.modifier_value] - Updated value
 * @param {number} [req.body.additional_price] - Updated price
 * @param {boolean} [req.body.is_active] - Active status
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Success message
 * @returns {Object} 404 - Modifier not found
 * @returns {Object} 500 - Server error
 */
export const updateModifierController = async (req, res) => {
  try {
    //Get id from param
    const { id } = req.params;

    //get update data from body
    const { modifier_name, modifier_value, additional_price, is_active } =
      req.body;

    //set default update_by
    const updated_by = 1;

    //check modifier is exist or not
    const exixtingModifier = await getModifierById(id);
    if (!exixtingModifier) {
      return notFound(res, "Modifier not found");
    }

    //call model function
    await updateModifier(id, {
      modifier_name,
      modifier_value,
      additional_price,
      is_active,
      updated_by,
    });

    //send success response
    return ok(res, "Modifier updated successfully");
  } catch (err) {
    console.error("Update Modifier Controller error ", err);
    return serverError(res, "Internal server error");
  }
};

/**
 * Soft delete a modifier
 *
 * @route DELETE /api/modifiers/:id
 * @access Public
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Modifier ID
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Success message
 * @returns {Object} 404 - Modifier not found
 * @returns {Object} 500 - Server error
 */
export const deleteModifierController = async (req, res) => {
  try {
    //get id from param
    const { id } = req.params;

    //set default deleted_by
    const deleted_by = 1;

    //check modifier is exist or not
    const existingModifier = await getModifierById(id);
    if (!existingModifier) {
      return notFound(res, "Modifier not found");
    }

    //call model function
    await deleteModifier(id, deleted_by);

    //send success response
    return ok(res, "Modifier deleted successfully");
  } catch (err) {
    console.error("Delete Modifier Controller error ", err);
    return serverError(res, "Internal server error");
  }
};

// ============================================================================
// MODIFIER PORTION CONTROLLERS
// ============================================================================

/**
 * Get all portions for a specific modifier
 *
 * @route GET /api/modifiers/:modifierId/portions
 * @access Public
 * @param {Object} req - Express request object
 * @param {string} req.params.modifier_id - Modifier ID
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Array of modifier portions
 * @returns {Object} 404 - No portions found
 * @returns {Object} 500 - Server error
 */
export const getAllModifierPortionsController = async (req, res) => {
  try {
    // Get modifier ID from URL params
    const { modifier_id } = req.params;

    //call model function
    const modifierPortions = await getModifierPortions(modifier_id);

    //check if empty
    if (!modifierPortions || modifierPortions.length === 0) {
      return notFound(res, "No modifier portions found");
    }

    //send success response
    return ok(res, "Modifier portions fetched successfully", modifierPortions);
  } catch (err) {
    console.error("Get All Modifier Portions Controller error ", err);
    return serverError(res, "Internal server error");
  }
};

/**
 * Create a new modifier-portion link
 *
 * @route POST /api/modifier-portions
 * @access Public
 * @param {Object} req - Express request object
 * @param {number} req.body.modifier_id - Modifier ID
 * @param {number} req.body.product_portion_id - Product portion ID
 * @param {number} [req.body.additional_price] - Additional price
 * @param {number} [req.body.stock] - Stock quantity
 * @param {Object} res - Express response object
 * @returns {Object} 201 - Created modifier portion with ID
 * @returns {Object} 409 - Duplicate link
 * @returns {Object} 500 - Server error
 */
export const createModifierPortionController = async (req, res) => {
  try {
    //get data from body
    const { modifier_id, product_portion_id, additional_price, stock } =
      req.body;

    // set default created_by
    const created_by = 1;

    //call model function
    const modifier_portion_id = await createModifierPortion({
      modifier_id,
      product_portion_id,
      additional_price,
      stock,
      created_by,
    });

    //send success response
    return created(res, "Modifier portion created successfully", {
      modifier_portion_id,
    });
  } catch (err) {
    console.error("Create Modifier Portion Controller error ", err);

    // Handle duplicate entry error
    if (err.code === "ER_DUP_ENTRY") {
      return conflict(
        res,
        "This modifier is already linked to this product portion",
      );
    }

    return serverError(res, "Internal server error");
  }
};

/**
 * Update an existing modifier portion
 *
 * @route PUT /api/modifier-portions/:id
 * @access Public
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Modifier portion ID
 * @param {number} [req.body.additional_price] - Updated price
 * @param {number} [req.body.stock] - Updated stock
 * @param {boolean} [req.body.is_active] - Active status
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Success message
 * @returns {Object} 500 - Server error
 */
export const updateModifierPortionController = async (req, res) => {
  try {
    // Get ID from URL params
    const { id } = req.params;

    // Get update data from body
    const { additional_price, stock, is_active } = req.body;

    // Set default updatedBy
    const updated_by = 1;

    // Call model function (no need to check if exists, model will handle it)
    await updateModifierPortion(id, {
      additional_price,
      stock,
      is_active,
      updated_by,
    });

    // Send success response
    return ok(res, "Modifier portion updated successfully");
  } catch (err) {
    console.error("Update Modifier Portion Controller error ", err);
    return serverError(res, "Internal server error");
  }
};

/**
 * Soft delete a modifier portion
 *
 * @route DELETE /api/modifier-portions/:id
 * @access Public
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Modifier portion ID
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Success message
 * @returns {Object} 500 - Server error
 */
export const deleteModifierPortionController = async (req, res) => {
  try {
    // Get ID from URL params
    const { id } = req.params;

    // Set default deletedBy
    const deleted_by = 1;

    // Call model function (no need to check if exists, model will handle it)
    await deleteModifierPortion(id, deleted_by);

    // Send success response
    return ok(res, "Modifier portion deleted successfully");
  } catch (err) {
    console.error("Delete Modifier Portion Controller error ", err);
    return serverError(res, "Internal server error");
  }
};
