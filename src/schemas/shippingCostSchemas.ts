import { z } from "zod";

export const shippingCostSchema = z.object({
  body: z.object({
    addressId: z.string().min(1, "id tujuan wajib diisi"),
    totalWeight: z.number().min(1, "Berat barang minimal 1 gram"),
  }),
});
