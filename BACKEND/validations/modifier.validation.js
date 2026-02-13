// Modifier Validation Schemas - Zod schemas for request validation

import { z } from "zod";

// ============================================================================
// MODIFIER MASTER SCHEMAS
// ============================================================================

// Schema for creating a new modifier
export const createModifierSchema = z.object({
  modifier_name: z.string().min(1, "Modifier name is required"),
  modifier_value: z.string().min(1, "Modifier value is required"),
  additional_price: z.number().min(0, "Price cannot be negative").optional(),
  created_by: z
    .number()
    .int()
    .positive("Created by must be a positive integer"),
});

// Schema for updating a modifier
export const updateModifierSchema = z.object({
  modifier_id: z
    .number()
    .int()
    .positive("Modifier ID must be a positive integer"),
  modifier_name: z.string().min(1, "Modifier name is required").optional(),
  modifier_value: z.string().min(1, "Modifier value is required").optional(),
  additional_price: z.number().min(0, "Price cannot be negative").optional(),
  is_active: z.boolean().optional(),
  updated_by: z
    .number()
    .int()
    .positive("Updated by must be a positive integer"),
});

// Schema for deleting a modifier
export const deleteModifierSchema = z.object({
  modifier_id: z
    .number()
    .int()
    .positive("Modifier ID must be a positive integer"),
  deleted_by: z
    .number()
    .int()
    .positive("Deleted by must be a positive integer"),
});

// ============================================================================
// MODIFIER PORTION SCHEMAS
// ============================================================================

// Schema for creating a modifier-portion link
export const createModifierPortionSchema = z.object({
  modifier_id: z
    .number()
    .int()
    .positive("Modifier ID must be a positive integer"),
  product_portion_id: z
    .number()
    .int()
    .positive("Product portion ID must be a positive integer"),
  additional_price: z.number().min(0, "Price cannot be negative").optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  created_by: z
    .number()
    .int()
    .positive("Created by must be a positive integer"),
});

// Schema for updating a modifier portion
export const updateModifierPortionSchema = z.object({
  modifier_portion_id: z
    .number()
    .int()
    .positive("Modifier portion ID must be a positive integer"),
  additional_price: z.number().min(0, "Price cannot be negative").optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  is_active: z.boolean().optional(),
  updated_by: z
    .number()
    .int()
    .positive("Updated by must be a positive integer"),
});

// Schema for deleting a modifier portion
export const deleteModifierPortionSchema = z.object({
  modifier_portion_id: z
    .number()
    .int()
    .positive("Modifier portion ID must be a positive integer"),
  deleted_by: z
    .number()
    .int()
    .positive("Deleted by must be a positive integer"),
});
