import { FulfillmentTypes, OrderStatuses, PaymentMethod } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { GetUserCartService } from "./cartServices";
import { sendOrderStatusUpdateEmail } from "../helper/emailSender";
import { AppError } from "../utils/appError";
import { getShippingCost } from "../helper/getShippingCost";
import {
  createOrderTransaction,
  createPaymentTransaction,
  validateCartItems,
} from "../helper/orderHelpers";

// Must match the tax rate used for display on the frontend.
const TAX_RATE = 0.11;

// The client-supplied `totalAmount` is NEVER trusted. Every component
// (item prices, shipping cost, tax) is recomputed here from data the
// server controls, and that is what actually gets stored/charged.
export async function CreateOrderService(
  userId: string,
  fulfillmentType: FulfillmentTypes,
  paymentMethod: PaymentMethod,
  courier: string,
  addressId: string
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

    const subtotal = await validateCartItems(cart.items);

    let shippingCost = 0;
    if (fulfillmentType === "DELIVERY") {
      const couriers = await getShippingCost(addressId, cart.totalWeight);
      const matchedCourier = couriers.find(
        (c: { name: string; cost: number }) => c.name === courier
      );

      if (!matchedCourier) {
        throw new AppError("Invalid courier selected", 400);
      }

      shippingCost = matchedCourier.cost;
    }

    const tax = subtotal * TAX_RATE;
    const totalAmount = Math.ceil(subtotal + shippingCost + tax);

    // Step 4: Create order in transaction
    const newOrder = await createOrderTransaction({
      userId,
      cart,
      fulfillmentType,
      paymentMethod,
      courier,
      addressId,
      totalAmount,
    });

    // Step 5: Create payment transaction
    if (
      (fulfillmentType === "DELIVERY" || fulfillmentType === "PICKUP") &&
      paymentMethod === "ONLINE"
    ) {
      const paymentToken = await createPaymentTransaction(newOrder);
      return {
        newOrder,
        paymentToken,
      };
    }

    return { newOrder };
  } catch (error) {
    throw error;
  }
}

export async function UpdateOrderStatusService(
  orderId: string,
  status: OrderStatuses,
  requester: { id: string; role: string }
) {
  try {
    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) throw new AppError("Order not found", 404);

    const isOwner = existingOrder.userId === requester.id;
    const isAdmin = requester.role === "ADMIN";

    if (!isAdmin) {
      // A regular customer may only confirm their OWN pending order after
      // completing checkout (PENDING -> PROCESSING). Every other status
      // transition (marking things delivered/cancelled/etc) is admin-only.
      if (!isOwner) {
        throw new AppError("Order not found", 404);
      }
      if (existingOrder.status !== "PENDING" || status !== "PROCESSING") {
        throw new AppError(
          "Forbidden: You do not have permission to perform this action",
          403
        );
      }
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: true,
        items: {
          include: {
            product: {
              include: { category: true, productPhotos: true},
            },
          },
        },
      },
    });

    sendOrderStatusUpdateEmail(updatedOrder);
    return updatedOrder;
  } catch (error) {
    throw error;
  }
}

export async function GetOrderItemsByOrderIdService(
  orderId: string,
  requester: { id: string; role: string }
) {
  try {
    const order = await prisma.orders.findUnique({ where: { id: orderId } });

    if (!order) throw new AppError("Order not found", 404);

    if (requester.role !== "ADMIN" && order.userId !== requester.id) {
      throw new AppError("Order not found", 404);
    }

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

    if (orderItems.length === 0) throw new AppError("order items not found", 404);

    return orderItems;
  } catch (error) {
    throw error;
  }
}

export async function GetUserOrdersService(userId: string) {
  try {
    const orders = await prisma.orders.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: "desc" },
    });
    return orders;
  } catch (error) {
    throw error;
  }
}

export async function GetAllOrderService( status: OrderStatuses ) {
  try {
    let orders;

    if (status) {
      orders = await prisma.orders.findMany({
        where: { status },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      orders = await prisma.orders.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    }

    return orders;
  } catch (error) {
    throw error;
  }
}
