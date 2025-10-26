import { z } from "zod";

export const uploadProductPhotoSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID wajib diisi"),
    file: z.any(), // File validation will be handled by multer middleware
  }),
});

export const updateProductPhotoSchema = z.object({
  body: z.object({
    photoId: z.string().min(1, "Photo ID wajib diisi"),
    file: z.any(), // File validation will be handled by multer middleware
  }),
});

export const setMainPhotoSchema = z.object({
  body: z.object({
    photoId: z.string().min(1, "Photo ID wajib diisi"),
    isDefault: z.boolean(),
  }),
});
