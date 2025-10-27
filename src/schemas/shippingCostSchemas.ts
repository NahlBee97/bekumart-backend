import { z } from "zod";

export const shippingCostSchema = z.object({
  body: z.object({
    addressId: z.string().min(1, "id tujuan wajib diisi"),
    totalWeight: z.number().min(0.01, "Berat barang minimal 0.01 Kg"),
  }),
});
