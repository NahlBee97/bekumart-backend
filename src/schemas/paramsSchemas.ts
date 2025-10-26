import z from "zod";

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID Tidak Ditemukan"),
  }),
});

export const itemIdParamSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, "ID Tidak Ditemukan"),
  }),
});

export const provinceParamSchema = z.object({
  params: z.object({
    province: z.string().min(1, "name provinsi tidak ditemukan"),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().min(1, "User ID wajib diisi"),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, "Order ID wajib diisi"),
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({
    productId: z.string().min(1, "Product ID wajib diisi"),
  }),
});

export const reviewIdParamSchema = z.object({
  params: z.object({
    reviewId: z.string().min(1, "Product ID wajib diisi"),
  }),
});


