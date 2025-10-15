import { FulfillmentTypes, PaymentMethod } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { snap } from "../utils/midtrans";
import { IOrderItem } from "../interfaces/orderInterfaces";

export async function validateCartItems(items: any[], expectedTotal: number) {
  let calculatedTotal = 0;

  for (const item of items) {
    // Validate product exists and is available
    const product = await prisma.products.findUnique({
      where: { id: item.productId },
      select: { stock: true, price: true, name: true },
    });

    if (!product) {
      throw new AppError(`Product "${item.productName}" not found`, 404);
    }

    if (product.stock === 0) {
      throw new AppError(`Product "${item.productName}" is not available`, 400);
    }

    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${item.productName}". Available: ${product.stock}, Requested: ${item.quantity}`,
        400
      );
    }

    // Validate price hasn't changed
    if (product.price !== item.product.price) {
      throw new AppError(
        `Price has changed for "${item.productName}". Please refresh your cart`,
        400
      );
    }

    calculatedTotal += product.price * item.quantity;
  }
}

export async function createPaymentTransaction(order: any) {
  const user = await prisma.users.findUnique({
    where: { id: order.userId },
    select: { name: true, email: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const parameter = {
    transaction_details: {
      order_id: order.id,
      gross_amount: order.totalAmount,
    },
    customer_details: {
      first_name: user.name,
      email: user.email,
    },
  };

  const transaction = await snap.createTransaction(parameter);

  if (!transaction?.token) {
    throw new AppError("Failed to create payment transaction", 502);
  }

  const paymentToken = transaction.token;
  return paymentToken;
}

export async function createOrderTransaction({
  userId,
  cart,
  fulfillmentType,
  courier,
  paymentMethod,
  addressId,
  totalCheckoutPrice,
}: {
  userId: string;
  cart: any;
  fulfillmentType: FulfillmentTypes;
  courier: string;
  paymentMethod: PaymentMethod;
  addressId: string;
  totalCheckoutPrice: number;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create order
    const order = await tx.orders.create({
      data: {
        userId,
        totalAmount: totalCheckoutPrice,
        totalWeight: cart.totalWeight,
        fulfillmentType,
        courier,
        paymentMethod,
        addressId,
        status: "PENDING",
      },
    });

    // 2. Create order items
    const orderItemsData = cart.items.map((item: IOrderItem) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
    }));

    await tx.orderItems.createMany({
      data: orderItemsData,
    });

    // 3. Update product stock levels
    for (const item of cart.items) {
      const updatedProduct = await tx.products.update({
        where: { id: item.productId },
        data: {
          sale: {
            increment: item.quantity,
          },
          stock: {
            decrement: item.quantity,
          },
        },
        select: { stock: true }, // Return stock to verify
      });

      // Double-check stock didn't go negative
      if (updatedProduct.stock < 0) {
        throw new AppError(
          `Insufficient stock for product ${item.productId}`,
          400
        );
      }
    }

    // 4. Clear the user's cart
    await tx.cartItems.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  });
}
