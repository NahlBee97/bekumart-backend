import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Product description is required"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().min(0, "Stock must be a positive number"),
  weightInKg: z.number().min(0, "Weight must be a positive number"),
  categoryId: z.string().min(1, "Category ID is required"),
});

export const UpdateProductSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    stock: z.number().min(0).optional(),
    weightInKg: z.number().min(0).optional(),
    categoryId: z.string().min(1).optional(),
});

// Create types from schemas to use in your services/controllers
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
