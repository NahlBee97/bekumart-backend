import { z } from "zod";

export const CreateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Nama produk minimal 3 karakter"),
    description: z.string().min(10, "Deskripsi produk minimal 10 karakter"),
    price: z.number().min(0, "Harga tidak boleh negatif"),
    stock: z.number().int().min(0, "Stok tidak boleh negatif"),
    weightInKg: z.number().min(0, "Berat tidak boleh negatif"),
    categoryId: z.string().min(1, "Kategori wajib diisi"),
  }),
});

export const UpdateProductSchema = CreateProductSchema.partial();
