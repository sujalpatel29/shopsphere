import {
  createPortion,
  getAllPortion,
  getPortionById,
} from "../models/portion.model.js";
import {
  created,
  notFound,
  conflict,
  ok,
  serverError,
  badRequest,
} from "../utils/apiResponse.js";

export const createPortionController = {
  createPortion: async (req, res) => {
    try {
      const { product_id, portion_value, price, stock, is_active } =
        req.validatedBody ?? req.body;

      const productExists = await createPortion.checkProductExists(product_id);

      if (!productExists) {
        return notFound(res, "Product not found or inactive");
      }

      const isDuplicate = await createPortion.checkDuplicatePortion(
        product_id,
        portion_value,
      );

      if (isDuplicate) {
        return conflict(
          res,
          `Portion '${portion_value}' already exists for this product`,
        );
      }

      const portionData = {
        product_id,
        portion_value,
        price,
        stock,
        is_active: is_active !== undefined ? is_active : true,
        created_by: req.user?.user_id || 1, // From auth middleware
      };

      const portionId = await createPortion.create(portionData);

      return created(res, "Portion created successfully", {
        portion_id: portionId,
        product_id: portionData.product_id,
        portion_value: portionData.portion_value,
        price: portionData.price,
        stock: portionData.stock,
        is_active: portionData.is_active,
      });
    } catch (error) {
      console.error("Create portion error:", error);
      return serverError(res, "Internal server error");
    }
  },
};

export const getAllPortionController = async (req, res) => {
  try {
    const getPortions = await getAllPortion();

    if (!getPortions || getPortions.length == 0) {
      return notFound(res, "portion not found");
    }
    return ok(res, "All Portions", getPortions);
  } catch (error) {
    console.error("Get portion error:", error);
    return serverError(res, "Internal server error");
  }
};

export const getPortionByIdController = async (req, res) => {
  try {
    const { portion_id } = req.params;

    if (!portion_id) {
      return badRequest(res, "portion_id is required");
    }

    const PortionById = await getPortionById(portion_id);

    if (!PortionById) {
      return notFound(res, "Portion by this ID not found");
    }

    return ok(res, "Portion by id get", PortionById);
  } catch (error) {
    console.error("Get portion id does not exist error:", error);
    return serverError(res, "Internal server error");
  }
};
