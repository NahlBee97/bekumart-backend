import { z } from "zod";

export const contactMessageSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Nama terlalu pendek")
      .max(50, "Nama terlalu panjang"),
    email: z.email("Email tidak valid").min(1, "Email wajib diisi"),
    message: z
      .string()
      .min(10, "Pesan terlalu pendek")
      .max(1000, "Pesan terlalu panjang"),
  }),
});
