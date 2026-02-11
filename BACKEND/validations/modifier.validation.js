/**
 * Modifier Validation Schemas
 *
 * This module contains Zod validation schemas for modifier-related API endpoints.
 * These schemas validate request body data before it reaches the controller layer.
 *
 * @module validations/modifier
 * @requires zod
 */

import { z } from "zod";

// ============================================================================
// MODIFIER MASTER SCHEMAS
// ============================================================================

/**
 * Validation schema for creating a new modifier
 *
 * @typedef {Object} CreateModifierInput
 * @property {string} modifierName - Name of the modifier (e.g., "Spice Level")
 * @property {string} modifierValue - Value of the modifier (e.g., "Extra Spicy")
 * @property {number} [additionalPrice=0] - Additional price for this modifier (must be >= 0)
 * @property {number} createdBy - User ID who is creating this modifier (must be positive integer)
 *
 * @example
 * // Valid input:
 * {
 *   "modifierName": "Extra Cheese",
 *   "modifierValue": "Double",
 *   "additionalPrice": 2.50,
 *   "createdBy": 1
 * }
 */
export const createModifierSchema = z.object({
  modifierName: z.string().min(1, "Modifier name is required"),
  modifierValue: z.string().min(1, "Modifier value is required"),
  additionalPrice: z.number().min(0, "Price cannot be negative").optional(),
  createdBy: z.number().int().positive("Created by must be a positive integer"),
});

/**
 * Validation schema for updating an existing modifier
 *
 * @typedef {Object} UpdateModifierInput
 * @property {number} modifierId - ID of the modifier to update (must be positive integer)
 * @property {string} [modifierName] - Updated name (optional)
 * @property {string} [modifierValue] - Updated value (optional)
 * @property {number} [additionalPrice] - Updated price (must be >= 0, optional)
 * @property {boolean} [isActive] - Active status (optional)
 * @property {number} updatedBy - User ID who is updating (must be positive integer)
 *
 * @example
 * // Valid input:
 * {
 *   "modifierId": 5,
 *   "modifierName": "Spice Level",
 *   "isActive": true,
 *   "updatedBy": 1
 * }
 */
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

/**
 * Validation schema for deleting a modifier (soft delete)
 *
 * @typedef {Object} DeleteModifierInput
 * @property {number} modifierId - ID of the modifier to delete (must be positive integer)
 * @property {number} deletedBy - User ID who is deleting (must be positive integer)
 *
 * @example
 * // Valid input:
 * {
 *   "modifierId": 5,
 *   "deletedBy": 1
 * }
 */
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

/**
 * Validation schema for creating a modifier-portion link
 *
 * Links a modifier to a specific product portion with custom pricing and stock.
 *
 * @typedef {Object} CreateModifierPortionInput
 * @property {number} modifierId - ID of the modifier (must be positive integer)
 * @property {number} productPortionId - ID of the product portion (must be positive integer)
 * @property {number} [additionalPrice=0] - Additional price for this combination (must be >= 0)
 * @property {number} [stock=0] - Available stock (must be >= 0)
 * @property {number} createdBy - User ID who is creating this link (must be positive integer)
 *
 * @example
 * // Valid input:
 * {
 *   "modifierId": 3,
 *   "productPortionId": 10,
 *   "additionalPrice": 1.50,
 *   "stock": 100,
 *   "createdBy": 1
 * }
 */
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
  stock: z.number().int().nonnegative("Stock cannot be negative").optional(),
  createdBy: z.number().int().positive("Created by must be a positive integer"),
});

/**
 * Validation schema for updating a modifier portion
 *
 * @typedef {Object} UpdateModifierPortionInput
 * @property {number} modifierPortionId - ID of the modifier portion to update (must be positive integer)
 * @property {number} [additionalPrice] - Updated price (must be >= 0, optional)
 * @property {number} [stock] - Updated stock quantity (must be >= 0, optional)
 * @property {boolean} [isActive] - Active status (optional)
 * @property {number} updatedBy - User ID who is updating (must be positive integer)
 *
 * @example
 * // Valid input:
 * {
 *   "modifierPortionId": 15,
 *   "stock": 50,
 *   "isActive": false,
 *   "updatedBy": 1
 * }
 */
export const updateModifierPortionSchema = z.object({
  modifierPortionId: z
    .number()
    .int()
    .positive("Modifier portion ID must be a positive integer"),
  additionalPrice: z.number().min(0, "Price cannot be negative").optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative").optional(),
  isActive: z.boolean().optional(),
  updatedBy: z.number().int().positive("Updated by must be a positive integer"),
});

/**
 * Validation schema for deleting a modifier portion (soft delete)
 *
 * @typedef {Object} DeleteModifierPortionInput
 * @property {number} modifierPortionId - ID of the modifier portion to delete (must be positive integer)
 * @property {number} deletedBy - User ID who is deleting (must be positive integer)
 *
 * @example
 * // Valid input:
 * {
 *   "modifierPortionId": 15,
 *   "deletedBy": 1
 * }
 */
export const deleteModifierPortionSchema = z.object({
  modifierPortionId: z
    .number()
    .int()
    .positive("Modifier portion ID must be a positive integer"),
  deletedBy: z.number().int().positive("Deleted by must be a positive integer"),
});
