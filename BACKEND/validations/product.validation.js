import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
  description: z.string().optional(),
  short_description: z.string().max(500).optional(),
  price: z.number({
    required_error: "Price is required"
  }).positive("Price must be greater than 0"),
  discounted_price: z.number().optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative").optional(),
  category_id: z.number().int().optional()      
})
.refine(data => {
  if (data.discounted_price !== undefined) {
    return data.discounted_price <= data.price;
  }
  return true;
}, {
  message: "Discounted price cannot be greater than price",
  path: ["discounted_price"]
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  display_name: z.string().min(2).optional(),
  description: z.string().optional(),
  short_description: z.string().max(500).optional(),
  price: z.number().positive().optional(),
  discounted_price: z.number().optional(),
  stock: z.number().int().nonnegative().optional(),
  category_id: z.number().int().optional(),
  is_active: z.number().int().optional()
});
