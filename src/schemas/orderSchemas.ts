import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID wajib ada"),
    addressId: z.string().optional(),
    courier: z.string().min(1, "Nama kurir wajib ada"),
    fullfillmentType: z.string().min(1, "Pemenuhan Order Wajib Ada"),
    paymentMethod: z.string().min(1, "Metode pembayaran wajib ada"),
    totalAmount: z.number().min(0, "Harga total wajib ada"),
  }),
});

export const PaymentTokenSchema = z.object({
  body: z.object({
    id: z.string().min(1, "ID wajib ada"),
    userId: z.string().min(1, "User ID wajib ada"),
    totalAmount: z.number().min(0, "Harga total wajib ada"),
  }),
});

export const updateOrderSchema = z.object({
  body: z.object({
    status: z
      .enum([
        "PENDING",
        "PROCESSING",
        "READY_FOR_PICKUP",
        "OUT_FOR_DELIVERY",
        "COMPLETED",
        "CANCELLED",
      ])
      .refine(
        (val) =>
          [
            "PENDING",
            "PROCESSING",
            "READY_FOR_PICKUP",
            "OUT_FOR_DELIVERY",
            "COMPLETED",
            "CANCELLED",
          ].includes(val),
        {
          message: "Status pesanan tidak valid",
        }
      ),
  }),
});
