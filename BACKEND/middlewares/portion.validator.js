import { z } from 'zod';
import { validationError } from "../utils/apiResponse.js";

export const createPortionSchema = z.object({
  // Product ID - must be a positive integer
  product_id: z
    .number({
      required_error: "product_id is required",
      invalid_type_error: "product_id must be a number"
    })
    .int("product_id must be an integer")
    .positive("product_id must be a positive number"),

  // Portion Value - must be a non-empty string
  portion_value: z
    .string({
      required_error: "portion_value is required",
      invalid_type_error: "portion_value must be a string"
    })
    .min(1, "portion_value cannot be empty")
    .max(50, "portion_value must be less than 50 characters")
    .trim(),

  // Price - must be a non-negative number
  price: z
    .number({
      required_error: "price is required",
      invalid_type_error: "price must be a number"
    })
    .nonnegative("price must be non-negative")
    .finite("price must be a finite number"),

  // Stock - must be a non-negative integer
  stock: z
    .number({
      required_error: "stock is required",
      invalid_type_error: "stock must be a number"
    })
    .int("stock must be an integer")
    .nonnegative("stock must be non-negative"),

  // is_active - optional boolean (defaults to true)
  is_active: z
    .boolean({
      invalid_type_error: "is_active must be a boolean"
    })
    .optional()
    .default(true)
});


export const validateCreatePortion = (data) => {
  try {
    const validatedData = createPortionSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    // Extract error messages from Zod
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return { success: false, errors };
  }
};

export const validateCreatePortionRequest = (req, res, next) => {
  const validation = validateCreatePortion(req.body);

  if (!validation.success) {
    return validationError(res, validation.errors, "validation failed");
  }

  req.validatedBody = validation.data;
  return next();
};
