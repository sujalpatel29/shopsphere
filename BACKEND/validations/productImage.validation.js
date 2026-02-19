import { z } from "zod";

const IMAGE_LEVELS = ["PRODUCT", "PORTION", "MODIFIER", "VARIANT"];

const normalizeNullableString = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "") {
    return "";
  }
  if (normalized === "null") {
    return null;
  }
  if (normalized === "undefined") {
    return undefined;
  }

  return value;
};

const optionalPositiveInt = z
  .preprocess(
    normalizeNullableString,
    z.union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()]),
  )
  .transform((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    return value;
  });

const nullableOptionalPositiveInt = z
  .preprocess(
    normalizeNullableString,
    z.union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()]),
  )
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === "" || value === null) {
      return null;
    }

    return value;
  });

const optionalPrimaryFlag = z
  .preprocess(
    normalizeNullableString,
    z.union([z.coerce.number().int(), z.literal(""), z.null(), z.undefined()]),
  )
  .transform((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    return value;
  })
  .refine((value) => value === undefined || value === 0 || value === 1, {
    message: "is_primary must be 0 or 1",
  });

export const uploadProductImageSchema = z
  .object({
    product_id: z.coerce.number().int().positive("product_id must be a valid integer"),
    image_level: z.enum(IMAGE_LEVELS, {
      message: "image_level must be one of PRODUCT, PORTION, MODIFIER, VARIANT",
    }),
    product_portion_id: optionalPositiveInt,
    modifier_portion_id: optionalPositiveInt,
    is_primary: optionalPrimaryFlag.transform((value) => (value === undefined ? 0 : value)),
  })
  .superRefine((data, ctx) => {
    const portionProvided = data.product_portion_id !== undefined;
    const modifierProvided = data.modifier_portion_id !== undefined;

    if (data.image_level === "PRODUCT") {
      if (portionProvided || modifierProvided) {
        ctx.addIssue({
          code: "custom",
          message:
            "For PRODUCT level, product_portion_id and modifier_portion_id must be NULL",
          path: ["image_level"],
        });
      }
    }

    if (data.image_level === "PORTION") {
      if (!portionProvided) {
        ctx.addIssue({
          code: "custom",
          message: "For PORTION level, product_portion_id is required",
          path: ["product_portion_id"],
        });
      }
      if (modifierProvided) {
        ctx.addIssue({
          code: "custom",
          message: "For PORTION level, modifier_portion_id must be NULL",
          path: ["modifier_portion_id"],
        });
      }
    }

    if (data.image_level === "MODIFIER") {
      if (!modifierProvided) {
        ctx.addIssue({
          code: "custom",
          message: "For MODIFIER level, modifier_portion_id is required",
          path: ["modifier_portion_id"],
        });
      }
      if (portionProvided) {
        ctx.addIssue({
          code: "custom",
          message: "For MODIFIER level, product_portion_id must be NULL",
          path: ["product_portion_id"],
        });
      }
    }

    if (data.image_level === "VARIANT") {
      if (!portionProvided || !modifierProvided) {
        ctx.addIssue({
          code: "custom",
          message:
            "For VARIANT level, both product_portion_id and modifier_portion_id are required",
          path: ["image_level"],
        });
      }
    }
  });

export const updateProductImageSchema = z.object({
  image_level: z
    .preprocess(
      normalizeNullableString,
      z.union([z.enum(IMAGE_LEVELS), z.literal(""), z.null(), z.undefined()]),
    )
    .transform((value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return value;
    }),
  product_portion_id: nullableOptionalPositiveInt,
  modifier_portion_id: nullableOptionalPositiveInt,
  is_primary: optionalPrimaryFlag,
});

export const productIdParamSchema = z.object({
  product_id: z.coerce.number().int().positive("product_id must be a valid integer"),
});

export const imageIdParamSchema = z.object({
  image_id: z.coerce.number().int().positive("image_id must be a valid integer"),
});

export const variantQuerySchema = z.object({
  product_portion_id: optionalPositiveInt,
  modifier_portion_id: optionalPositiveInt,
});
