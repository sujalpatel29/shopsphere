// Modifier Controllers - Business logic for modifier API endpoints

import {
  getAllModifiers,
  getModifierById,
  getModifierByIdForAdmin,
  checkModifierExists,
  createModifier,
  updateModifier,
  deleteModifier,
  toggleModifierActive,
  // patchModifier,
  getModifierPortions,
  getModifierPortionById,
  getModifierPortionByIdForAdmin,
  getModifiersByProductPortion,
  checkProductPortionExists,
  createModifierPortion,
  updateModifierPortion,
  deleteModifierPortion,
  checkModifierPortionExists,
  toggleModifierPortionActive,
  // patchModifierPortion,
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

export const createModifierController = async (req, res) => {
  try {
    //Get data form body
    const { modifier_name, modifier_value, additional_price } = req.body;

    // Check if duplicate exists
    const exists = await checkModifierExists(modifier_name, modifier_value);
    if (exists) {
      return conflict(
        res,
        `Modifier "${modifier_name} - ${modifier_value}" already exists`,
      );
    }

    // Set default createdBy (in real app, this comes from auth token)
    const created_by = req.user.id;

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

export const updateModifierController = async (req, res) => {
  try {
    //Get id from param
    const { id } = req.params;

    //get update data from body
    const { modifier_name, modifier_value, additional_price, is_active } =
      req.body;

    //set default update_by
    const updated_by = req.user.id;

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

export const deleteModifierController = async (req, res) => {
  try {
    //get id from param
    const { id } = req.params;

    //set default deleted_by
    const deleted_by = req.user.id;

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

// Toggle modifier active status
export const toggleModifierController = async (req, res) => {
  try {
    const { id } = req.params;

    // Get user ID from token
    const updated_by = req.user.id;

    // Check if modifier exists (admin view - includes inactive)
    const existingModifier = await getModifierByIdForAdmin(id);
    if (!existingModifier) {
      return notFound(res, "Modifier not found");
    }

    // Toggle the status
    await toggleModifierActive(id, updated_by);

    // Derive new state instead of re-fetching
    const newIsActive = !existingModifier.is_active;

    return ok(res, "Modifier status toggled successfully", {
      is_active: newIsActive,
    });
  } catch (err) {
    console.error("Toggle Modifier Controller error", err);
    return serverError(res, "Internal server error");
  }
};

// //Partial update modifier
// export const patchModifierController = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     // Get user ID from token
//     updates.updated_by = req.user.id;

//     // Check if modifier exists
//     const existingModifier = await getModifierById(id);
//     if (!existingModifier) {
//       return notFound(res, "Modifier not found");
//     }

//     // Update only provided fields
//     await patchModifier(id, updates);
//     return ok(res, "Modifier updated successfully");
//   } catch (err) {
//     console.error("Patch Modifier Controller error", err);
//     return serverError(res, "Internal server error");
//   }
// };

// ============================================================================
// MODIFIER PORTION CONTROLLERS
// ============================================================================

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

export const getModifiersByProductPortionController = async (req, res) => {
  try {
    const { product_portion_id } = req.params;

    // Check if product portion exists
    const portionExists = await checkProductPortionExists(product_portion_id);
    if (!portionExists) {
      return notFound(res, "Product portion not found");
    }

    const modifiers = await getModifiersByProductPortion(product_portion_id);

    // If portion exists but has no modifiers
    if (modifiers.length === 0) {
      return ok(res, "No modifiers available for this portion", []);
    }

    return ok(res, "Modifiers retrieved successfully", modifiers);
  } catch (err) {
    console.error("Get Modifiers By Product Portion error", err);
    return serverError(res, "Internal server error");
  }
};

export const createModifierPortionController = async (req, res) => {
  try {
    //get data from body
    const { modifier_id, product_portion_id, additional_price, stock } =
      req.body;

    // Check if modifier exists
    const modifierExists = await getModifierByIdForAdmin(modifier_id);
    if (!modifierExists) {
      return notFound(res, "Modifier not found");
    }

    // Check if product portion exists
    const portionExists = await checkProductPortionExists(product_portion_id);
    if (!portionExists) {
      return notFound(res, "Product portion not found");
    }

    // Check if duplicate exists
    const exists = await checkModifierPortionExists(
      modifier_id,
      product_portion_id,
    );
    if (exists) {
      return conflict(
        res,
        `Modifier portion already exists for this modifier and product portion combination`,
      );
    }

    // set default created_by
    const created_by = req.user.id;

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

export const updateModifierPortionController = async (req, res) => {
  try {
    // Get ID from URL params
    const { id } = req.params;

    // Get update data from body
    const { additional_price, stock, is_active } = req.body;

    // Set default updatedBy
    const updated_by = req.user.id;

    // Check if modifier portion exists
    const existingPortion = await getModifierPortionById(id);
    if (!existingPortion) {
      return notFound(res, "Modifier portion not found");
    }

    // Call model function
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

export const deleteModifierPortionController = async (req, res) => {
  try {
    // Get ID from URL params
    const { id } = req.params;

    // Set default deletedBy
    const deleted_by = req.user.id;

    // Check if modifier portion exists
    const existingPortion = await getModifierPortionById(id);
    if (!existingPortion) {
      return notFound(res, "Modifier portion not found");
    }

    // Call model function
    await deleteModifierPortion(id, deleted_by);

    // Send success response
    return ok(res, "Modifier portion deleted successfully");
  } catch (err) {
    console.error("Delete Modifier Portion Controller error ", err);
    return serverError(res, "Internal server error");
  }
};

// Toggle modifier portion active status
export const toggleModifierPortionController = async (req, res) => {
  try {
    const { id } = req.params;

    // Get user ID from token
    const updated_by = req.user.id;

    // Get existing portion first (admin view - includes inactive)
    const existingPortion = await getModifierPortionByIdForAdmin(id);
    if (!existingPortion) {
      return notFound(res, "Modifier portion not found");
    }

    // Toggle
    await toggleModifierPortionActive(id, updated_by);

    // Derive new state
    const newIsActive = !existingPortion.is_active;

    return ok(res, "Modifier portion status toggled successfully", {
      is_active: newIsActive,
    });
  } catch (err) {
    console.error("Toggle Modifier Portion Controller error", err);
    return serverError(res, "Internal server error");
  }
};

// // Partial update modifier portion
// export const patchModifierPortionController = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     // Get user ID from token
//     updates.updated_by = req.user.id;

//     // Update only provided fields
//     await patchModifierPortion(id, updates);

//     return ok(res, "Modifier portion updated successfully");
//   } catch (err) {
//     console.error("Patch Modifier Portion Controller error", err);
//     return serverError(res, "Internal server error");
//   }
// };
