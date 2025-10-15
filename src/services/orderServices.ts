import { FulfillmentTypes, OrderStatuses, PaymentMethod } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { GetUserCartService } from "./cartServices";
import { sendOrderStatusUpdateEmail } from "../helper/emailSender";
import { AppError } from "../utils/appError";
import {
  createOrderTransaction,
  createPaymentTransaction,
  validateCartItems,
} from "../helper/orderHelpers";

export async function CreateOrderService(
  userId: string,
  fulfillmentType: FulfillmentTypes,
  paymentMethod: PaymentMethod,
  courier: string,
  addressId: string,
  totalCheckoutPrice: number
) {
  try {
    const cart = await GetUserCartService(userId);

    if (!cart?.items?.length) {
      throw new AppError("Cart is empty", 400);
    }

    if (fulfillmentType === "DELIVERY" && addressId) {
      const userAddress = await prisma.addresses.findFirst({
        where: {
          id: addressId,
          userId: userId,
        },
      });

      if (!userAddress) {
        throw new AppError("Address not found or does not belong to user", 400);
      }
    }

    await validateCartItems(cart.items, totalCheckoutPrice);

    // Step 4: Create order in transaction
    const newOrder = await createOrderTransaction({
      userId,
      cart,
      fulfillmentType,
      paymentMethod,
      courier,
      addressId,
      totalCheckoutPrice: Math.ceil(totalCheckoutPrice),
    });

    // Step 5: Create payment transaction
    if (
      (fulfillmentType === "DELIVERY" || fulfillmentType === "PICKUP") &&
      paymentMethod === "ONLINE"
    ) {
      const paymentToken = await createPaymentTransaction(
        newOrder,
      );
      return {
        newOrder,
        paymentToken,
      };
    }

    return { newOrder };
  } catch (error) {
    console.error("Error in CreateOrderService:", error);
    throw new AppError("Could not create order", 500);
  }
}

export async function UpdateOrderStatusService(
  orderId: string,
  status: OrderStatuses
) {
  try {
    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: true,
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });

    sendOrderStatusUpdateEmail(updatedOrder);
    return updatedOrder;
  } catch (error) {
    throw new AppError("can not update oreder status", 500);
  }
}

export async function GetOrderItemsByOrderIdService(orderId: string) {
  try {
    const orderItems = await prisma.orderItems.findMany({
      where: {
        orderId,
      },
      include: {
        product: {
          include: {
            productPhotos: true,
          },
        },
      },
    });

    if (!orderItems) throw new AppError("order items not found", 404);

    return orderItems;
  } catch (error) {
    throw new AppError("can not get order item", 500);
  }
}

export async function GetUserOrdersService(userId: string) {
  try {
    const orders = await prisma.orders.findMany({
      where: {
        userId,
      },
    });
    return orders;
  } catch (err) {
    throw new AppError("can not get orders", 500);
  }
}

export async function GetAllOrderService() {
  try {
    const orders = await prisma.orders.findMany({
      include: { user: true },
    });
    return orders;
  } catch (err) {
    throw new AppError("can not get orders item", 500);
  }
}
