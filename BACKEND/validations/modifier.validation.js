// Modifier Validation Schemas - Zod schemas for request validation

import { z } from "zod";

// ============================================================================
// MODIFIER MASTER SCHEMAS
// ============================================================================

// Schema for creating a new modifier
export const createModifierSchema = z.object({
  modifierName: z.string().min(1, "Modifier name is required"),
  modifierValue: z.string().min(1, "Modifier value is required"),
  additionalPrice: z.number().min(0, "Price cannot be negative").optional(),
  createdBy: z.number().int().positive("Created by must be a positive integer"),
});

// Schema for updating a modifier
export const updateModifierSchema = z.object({
  modifierId: z
    .number()
    .int()
    .positive("Modifier ID must be a positive integer"),
  modifierName: z.string().min(1, "Modifier name is required").optional(),
  modifierValue: z.string().min(1, "Modifier value is required").optional(),
  additionalPrice: z.number().min(0, "Price cannot be negative").optional(),
  isActive: z.boolean().optional(),
  updatedBy: z.number().int().positive("Updated by must be a positive integer"),
});

// Schema for deleting a modifier
export const deleteModifierSchema = z.object({
  modifierId: z
    .number()
    .int()
    .positive("Modifier ID must be a positive integer"),
  deletedBy: z.number().int().positive("Deleted by must be a positive integer"),
});

// ============================================================================
// MODIFIER PORTION SCHEMAS
// ============================================================================

// Schema for creating a modifier-portion link
export const createModifierPortionSchema = z.object({
  modifierId: z
    .number()
    .int()
    .positive("Modifier ID must be a positive integer"),
  productPortionId: z
    .number()
    .int()
    .positive("Product portion ID must be a positive integer"),
  additionalPrice: z.number().min(0, "Price cannot be negative").optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  createdBy: z.number().int().positive("Created by must be a positive integer"),
});

// Schema for updating a modifier portion
export const updateModifierPortionSchema = z.object({
  modifierPortionId: z
    .number()
    .int()
    .positive("Modifier portion ID must be a positive integer"),
  additionalPrice: z.number().min(0, "Price cannot be negative").optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  isActive: z.boolean().optional(),
  updatedBy: z.number().int().positive("Updated by must be a positive integer"),
});

// Schema for deleting a modifier portion
export const deleteModifierPortionSchema = z.object({
  modifierPortionId: z
    .number()
    .int()
    .positive("Modifier portion ID must be a positive integer"),
  deletedBy: z.number().int().positive("Deleted by must be a positive integer"),
});
