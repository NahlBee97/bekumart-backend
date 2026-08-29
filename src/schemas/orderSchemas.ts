import { z } from "zod";

export const createOrderSchema = z.object({
  // userId and totalAmount are intentionally NOT accepted here - userId
  // comes from the verified token and totalAmount is recomputed
  // server-side, so client-supplied values for either are ignored even
  // if present in the body.
  body: z.object({
    addressId: z.string().optional(),
    courier: z.string().optional(),
    fullfillmentType: z.string().min(1, "Pemenuhan Order Wajib Ada"),
    paymentMethod: z.string().min(1, "Metode pembayaran wajib ada"),
  }),
});

export const PaymentTokenSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, "Order ID wajib ada"),
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
