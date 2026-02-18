import {
  activeupdateOfferStatusById,
  checkOfferExist,
  createOffer,
  deleteOfferById,
  getActiveOffer,
  getAllOffer,
  getOfferById,
  updateOfferById,
  getValidateOfferByName,
  getOfferUsageCount,
  isOfferMappedToScope,
  getOfferUsageByOfferId,
  getOfferUsageByUserId,
  getAllOfferUsageSummary,
  createOfferProductCategoryMapping,
  deleteOfferProductCategoryMappingById,
  getAllOfferProductCategoryMappings,
  getOfferProductCategoryMappingById,
  getOfferProductCategoryMappingsByOfferId,
  isOfferProductCategoryDuplicateOnUpdate,
  isOfferExistsById,
  isOfferProductCategoryMappingExists,
  updateOfferProductCategoryMappingById,
} from "../models/offer.model.js";
import { getCartItemsWithProduct } from "../models/cart.model.js";
import {
  badRequest,
  conflict,
  created,
  notFound,
  ok,
  serverError,
} from "../utils/apiResponse.js";

// ============================================================================
// OFFER CONTROLLERS
// ============================================================================

// ============================================================================
// OFFER MASTER CONTROLLERS
// ============================================================================

/**
 * Create a new offer.
 * Flow:
 * - checks for conflicting offer in same scope/time window
 * - validates request payload presence (extra safety; primary validation is in middleware)
 * - persists offer record
 */
export const createOfferController = async (req, res) => {
  try {
    // Validate request payload before creating an offer.
    const offerData = req.body;
    const userId = req.user.id;

    const exists = await checkOfferExist(offerData);

    if (exists) {
      return conflict(res, "Offer already exists in the same time slot");
    }
    if (!offerData || Object.keys(offerData).length === 0) {
      return badRequest(res, "Request body is required");
    }

    const result = await createOffer(offerData, userId);

    return created(res, "Offer created successfully", {
      offer_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return serverError(res, error.message || "Internal server error");
  }
};

// ============================================================================
// OFFER PRODUCT CATEGORY MAPPING CONTROLLERS
// ============================================================================

/**
 * Create offer-product/category mapping.
 * Rules:
 * - offer must exist and not be deleted
 * - exactly one of product_id/category_id is expected via validator
 * - duplicate active mapping for same offer-scope is blocked
 */
export const createOfferProductCategoryMappingController = async (req, res) => {
  try {
    const mappingData = req.body;
    const userId = req.user.id;

    const offerExists = await isOfferExistsById(mappingData.offer_id);
    if (!offerExists) {
      return notFound(res, "Offer not found");
    }

    const mappingExists =
      await isOfferProductCategoryMappingExists(mappingData);
    if (mappingExists) {
      return conflict(res, "Offer mapping already exists");
    }

    const result = await createOfferProductCategoryMapping(mappingData, userId);
    const createdMapping = await getOfferProductCategoryMappingById(
      result.insertId,
    );

    return created(
      res,
      "Offer mapping created successfully",
      createdMapping[0],
    );
  } catch (error) {
    console.error(error);
    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Fetch all product/category mappings.
 */
export const getAllOfferProductCategoryMappingsController = async (
  req,
  res,
) => {
  try {
    const result = await getAllOfferProductCategoryMappings();

    if (!result || result.length === 0) {
      return notFound(res, "No mappings found");
    }

    return ok(res, "Offer mappings fetched successfully", result);
  } catch (error) {
    console.error(error);
    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Fetch all product/category mappings for a given offer id.
 */
export const getOfferProductCategoryMappingsByOfferIdController = async (
  req,
  res,
) => {
  try {
    const offerId = req.params.id;

    const offerExists = await isOfferExistsById(offerId);
    if (!offerExists) {
      return notFound(res, "Offer not found");
    }

    const result = await getOfferProductCategoryMappingsByOfferId(offerId);
    if (!result || result.length === 0) {
      return notFound(res, "No mapping found for this offer");
    }

    return ok(res, "Offer mappings fetched successfully", result);
  } catch (error) {
    console.error(error);
    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Update offer-product/category mapping by mapping id.
 * Supports:
 * - toggling is_active
 * - switching mapping scope product<->category
 * Duplicate scope for same offer is blocked.
 */
export const updateOfferProductCategoryMappingByIdController = async (
  req,
  res,
) => {
  try {
    const mappingId = req.params.id;
    const userId = req.user.id;
    const payload = req.body;

    const existing = await getOfferProductCategoryMappingById(mappingId);
    if (!existing || existing.length === 0) {
      return notFound(res, "Mapping not found");
    }

    const current = existing[0];

    // Validate that both product_id and category_id are not provided together.
    const hasProductId = Object.prototype.hasOwnProperty.call(
      payload,
      "product_id",
    );
    const hasCategoryId = Object.prototype.hasOwnProperty.call(
      payload,
      "category_id",
    );

    if (hasProductId && hasCategoryId) {
      return badRequest(
        res,
        "Cannot update both product_id and category_id in the same request. Provide only one scope.",
      );
    }

    // If one scope is provided, force the other to NULL to keep exactly one scope.
    const updateData = { ...payload };
    if (hasProductId) {
      updateData.category_id = null;
    }
    if (hasCategoryId) {
      updateData.product_id = null;
    }

    const finalProductId = Object.prototype.hasOwnProperty.call(
      updateData,
      "product_id",
    )
      ? updateData.product_id
      : current.product_id;
    const finalCategoryId = Object.prototype.hasOwnProperty.call(
      updateData,
      "category_id",
    )
      ? updateData.category_id
      : current.category_id;

    const hasDuplicate = await isOfferProductCategoryDuplicateOnUpdate(
      current.offer_id,
      finalProductId,
      finalCategoryId,
      mappingId,
    );
    if (hasDuplicate) {
      return conflict(res, "Offer mapping already exists");
    }

    const result = await updateOfferProductCategoryMappingById(
      mappingId,
      updateData,
      userId,
    );

    if (!result || result.affectedRows === 0) {
      return notFound(res, "Mapping not found or already deleted");
    }

    const updatedMapping = await getOfferProductCategoryMappingById(mappingId);

    return ok(res, "Offer mapping updated successfully", updatedMapping[0]);
  } catch (error) {
    console.error(error);
    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Soft delete mapping by mapping id.
 */
export const deleteOfferProductCategoryMappingByIdController = async (
  req,
  res,
) => {
  try {
    const mappingId = req.params.id;
    const userId = req.user.id;

    const result = await deleteOfferProductCategoryMappingById(
      mappingId,
      userId,
    );

    if (!result || result.affectedRows === 0) {
      return notFound(res, "Mapping not found or already deleted");
    }

    return ok(res, "Offer mapping deleted successfully");
  } catch (error) {
    console.error(error);
    return serverError(res, error.message || "Internal server error");
  }
};

// ============================================================================
// OFFER MASTER CONTROLLERS (CONTINUED)
// ============================================================================

/**
 * Fetch all offers (including active/inactive and soft-delete state as returned by model query).
 */
export const getAllOfferController = async (req, res) => {
  try {
    // Fetch all offers.
    const result = await getAllOffer();

    if (!result || result.length === 0) {
      return notFound(res, "No offers found");
    }

    return ok(res, `${result.length} Offers fetched successfully`, result);
  } catch (error) {
    console.error(error);

    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Fetch a single active, non-deleted offer by id.
 * Note: underlying model currently filters by `is_active=1` and `is_deleted=0`.
 */
export const getOfferByIdController = async (req, res) => {
  try {
    // Fetch a single offer by id.
    const offerId = req.params.id;
    const result = await getOfferById(offerId);

    if (!result || result.length === 0) {
      return notFound(res, "No offers found or deleted");
    }

    return ok(res, "Offer fetched successfully", result);
  } catch (error) {
    console.error(error);

    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Update an offer by id with partial payload fields.
 * Validation middleware ensures payload shape before controller runs.
 */
export const updateOfferByIdController = async (req, res) => {
  try {
    // Read target offer id from route and partial update payload from body.
    const offerId = req.params.id;
    const offerData = req.body;
    const userId = req.user.id;

    const result = await updateOfferById(offerId, offerData, userId);

    // `affectedRows = 0` means id not found or soft-deleted.
    if (!result || result.affectedRows === 0) {
      return notFound(res, "Offer not found or already deleted");
    }

    return ok(res, "Offer updated successfully");
  } catch (error) {
    console.error(error);

    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Soft delete an offer by id (`is_deleted=1`).
 */
export const deleteOfferByIdController = async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;
    const result = await deleteOfferById(offerId, userId);

    // Soft delete only works when row exists and is not already deleted.
    if (!result || result.affectedRows === 0) {
      return notFound(res, "No offers found");
    }

    return ok(res, "Offer deleted successfully");
  } catch (error) {
    console.error(error);
    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Update offer active status (`is_active` = 0 or 1).
 * Used by admin to activate/deactivate an offer without deleting it.
 */
export const updateOfferStatusController = async (req, res) => {
  try {
    const offerId = req.params.id;
    const isActive = req.body.is_active;
    const userId = req.user.id;

    const result = await activeupdateOfferStatusById(isActive, offerId, userId);

    // No target row matched for update.
    if (!result || result.affectedRows === 0) {
      return notFound(res, "No offers found");
    }

    return ok(
      res,
      isActive === 1
        ? "Offer activated successfully"
        : "Offer deactivated successfully",
    );
  } catch (error) {
    console.error(error);
    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Fetch all active offers.
 * Returns offers where `is_active=1` and `is_deleted=0`.
 */
export const getActiveOfferController = async (req, res) => {
  try {
    const result = await getActiveOffer();

    if (!result || result.length === 0) {
      return notFound(res, "No offers found");
    }

    return ok(
      res,
      `${result.length} Active Offers fetched successfully`,
      result,
    );
  } catch (error) {
    console.error(error);

    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Validate whether an offer can be applied for the current order context.
 * Checks:
 * - active/non-expired offer in matching scope
 * - minimum purchase amount
 * - per-user usage limit
 * - discount amount and final payable total
 */
export const validateOfferController = async (req, res) => {
  try {
    // User ID comes from authenticated request context
    const userId = req.user.id;

    // Body is pre-validated by `validateOfferPayload` middleware.
    const { offer_name, product_id, category_id } = req.body;

    // Step 0: Get cart total from database (more secure than trusting client)
    let cartTotal = 0;
    if (req.cart) {
      // If cart middleware attached the cart, use it
      const cartItems = await getCartItemsWithProduct(req.cart.cart_id);
      cartTotal = cartItems.reduce(
        (sum, item) => sum + Number(item.effective_price) * item.quantity,
        0,
      );
    } else {
      // Fallback: accept total from request body if no cart context
      const { total } = req.body;
      if (!total || total <= 0) {
        return badRequest(res, "Invalid total amount provided");
      }
      cartTotal = total;
    }

    // Step 1: Fetch a currently valid offer.
    const result = await getValidateOfferByName(offer_name);

    if (!result || result.length === 0) {
      return badRequest(res, "Offer not valid or expired");
    }

    const offer = result[0];

    // Step 2: Ensure offer is mapped to requested product/category scope.
    const hasScopeMapping = await isOfferMappedToScope(
      offer.offer_id,
      product_id ?? null,
      category_id ?? null,
    );
    if (!hasScopeMapping) {
      return badRequest(
        res,
        "Offer is not applicable for provided product/category",
      );
    }

    // Step 3: Enforce minimum purchase amount if configured.
    if (offer.min_purchase_amount && cartTotal < offer.min_purchase_amount) {
      return badRequest(
        res,
        `Minimum purchase amount is ${offer.min_purchase_amount}`,
      );
    }

    // Step 4: Enforce per-user usage limit if configured.
    if (offer.usage_limit_per_user) {
      const usageCount = await getOfferUsageCount(offer.offer_id, userId);

      if (usageCount >= offer.usage_limit_per_user) {
        return badRequest(res, "Offer usage limit exceeded");
      }
    }

    // Step 5: Calculate discount and final amount.
    let discountAmount = 0;
    const type = offer.discount_type.toLowerCase();

    if (type === "percentage") {
      discountAmount = (cartTotal * offer.discount_value) / 100;

      if (
        offer.maximum_discount_amount &&
        discountAmount > offer.maximum_discount_amount
      ) {
        discountAmount = offer.maximum_discount_amount;
      }
    } else if (type === "fixed_amount") {
      discountAmount = Math.min(offer.discount_value, cartTotal);
    }

    // Consumer/order module should persist usage in `offer_usage` after successful order placement.
    return ok(res, "Offer is valid", {
      offer_id: offer.offer_id,
      discount_amount: discountAmount,
      final_amount: cartTotal - discountAmount,
    });
  } catch (error) {
    console.error(error);

    return serverError(res, error.message || "Internal server error");
  }
};

// ============================================================================
// OFFER USAGE CONTROLLERS
// ============================================================================

/**
 * Fetch usage history rows for a given offer id.
 */
export const getOfferUsageByOfferIdController = async (req, res) => {
  try {
    // Route param `id` here represents `offer_id`.
    const offerId = req.params.id;

    const result = await getOfferUsageByOfferId(offerId);

    if (!result || result.length === 0) {
      return notFound(res, "No usage found for this offer by given offer id");
    }

    return ok(res, `Offer used ${result.length} times by given offer id`, {
      usage_details: result,
    });
  } catch (error) {
    console.error(error);

    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Fetch usage history rows for a given user id.
 * Response includes both count and detailed usage rows.
 */
export const getOfferUsageByUserIdController = async (req, res) => {
  try {
    // Route param `id` here represents `user_id`.
    const userId = req.params.id;

    const result = await getOfferUsageByUserId(userId);

    if (!result || result.length === 0) {
      return notFound(res, "No usage found for this offer by given user id");
    }

    return ok(res, `Offer used ${result.length} times by given user id`, {
      total_usage: result.length,
      usage_details: result,
    });
  } catch (error) {
    console.error(error);

    return serverError(res, error.message || "Internal server error");
  }
};

/**
 * Fetch aggregated usage analytics for all offers.
 * Intended for admin/reporting dashboards.
 */
export const getAllOfferUsageSummaryController = async (req, res) => {
  try {
    const result = await getAllOfferUsageSummary();

    return ok(res, "Offer usage summary fetched successfully", result);
  } catch (error) {
    console.error(error);

    return serverError(res, error.message || "Internal server error");
  }
};
