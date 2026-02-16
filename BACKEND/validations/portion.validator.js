import { z } from "zod";
import { validationError } from "../utils/apiResponse.js";

const booleanSchema = z.coerce
  .number({
    invalid_type_error: "is_active must be a tinyint value (0 or 1)",
  })
  .int("is_active must be a tinyint value (0 or 1)")
  .refine((value) => value === 0 || value === 1, {
    message: "is_active must be 0 or 1",
  });

const portionValueSchema = z
  .string({
    required_error: "portion_value is required",
    invalid_type_error: "portion_value must be a string",
  })
  .trim()
  .min(1, "portion_value cannot be empty")
  .max(50, "portion_value must be less than 50 characters");

const descriptionSchema = z
  .string({
    invalid_type_error: "description must be a string",
  })
  .trim()
  .max(255, "description must be less than 255 characters")
  .optional();

const priceSchema = z
  .number({
    required_error: "price is required",
    invalid_type_error: "price must be a number",
  })
  .finite("price must be a finite number")
  .nonnegative("price must be non-negative");

const discountedPriceSchema = z
  .number({
    invalid_type_error: "discounted_price must be a number",
  })
  .finite("discounted_price must be a finite number")
  .nonnegative("discounted_price must be non-negative")
  .optional();

const stockSchema = z
  .number({
    invalid_type_error: "stock must be a number",
  })
  .int("stock must be an integer")
  .nonnegative("stock must be non-negative")
  .optional();

const productIdSchema = z.coerce
  .number({
    required_error: "product_id is required",
    invalid_type_error: "product_id must be a number",
  })
  .int("product_id must be an integer")
  .positive("product_id must be a positive number");

const portionIdSchema = z.coerce
  .number({
    required_error: "portion_id is required",
    invalid_type_error: "portion_id must be a number",
  })
  .int("portion_id must be an integer")
  .positive("portion_id must be a positive number");

const productPortionIdSchema = z.coerce
  .number({
    required_error: "product_portion_id is required",
    invalid_type_error: "product_portion_id must be a number",
  })
  .int("product_portion_id must be an integer")
  .positive("product_portion_id must be a positive number");

export const portionCreateSchema = z.object({
  portion_value: portionValueSchema,
  description: descriptionSchema,
  is_active: booleanSchema.optional(),
});

export const portionUpdateSchema = z.object({
  portion_value: portionValueSchema,
  description: descriptionSchema,
  is_active: booleanSchema,
});

export const portionIdParamSchema = z.object({
  portion_id: portionIdSchema,
});

export const productIdParamSchema = z.object({
  product_id: productIdSchema,
});

export const productPortionIdParamSchema = z.object({
  product_portion_id: productPortionIdSchema,
});

export const productPortionCreateSchema = z
  .object({
    product_id: productIdSchema,
    portion_id: portionIdSchema,
    price: priceSchema,
    discounted_price: discountedPriceSchema,
    stock: stockSchema,
    is_active: booleanSchema.optional(),
  })
  .refine(
    (data) =>
      data.discounted_price === undefined ||
      data.discounted_price < data.price,
    {
      message: "discounted_price must be less than price",
      path: ["discounted_price"],
    },
  );

export const productPortionUpdateSchema = z
  .object({
    price: priceSchema.optional(),
    discounted_price: discountedPriceSchema,
    stock: stockSchema,
    is_active: booleanSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .refine(
    (data) =>
      data.discounted_price === undefined ||
      data.price === undefined ||
      data.discounted_price < data.price,
    {
      message: "discounted_price must be less than price",
      path: ["discounted_price"],
    },
  );

const validateWith = (schema, source, targetKey) => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return validationError(res, errors, "validation failed");
  }
  req[targetKey] = result.data;
  return next();
};

export const validateBody = (schema) => validateWith(schema, "body", "validatedBody");
export const validateParams = (schema) =>
  validateWith(schema, "params", "validatedParams");

// Backwards-compatible exports
export const createPortionSchema = productPortionCreateSchema;
export const validateCreatePortion = (data) =>
  productPortionCreateSchema.safeParse(data);
export const validateCreatePortionRequest = validateBody(
  productPortionCreateSchema,
);
