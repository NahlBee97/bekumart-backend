import { z } from "zod";

export const AddItemToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID wajib diisi"),
    quantity: z.number().int().min(1, "Quantity minimal 1"),
  }),
});

export const UpdateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1, "Quantity minimal 1"),
  }),
});

export const RemoveCartItemSchema = z.object({
  body: z.object({
    cartId: z.string().min(1, "Cart ID wajib diisi"),
  }),
});
