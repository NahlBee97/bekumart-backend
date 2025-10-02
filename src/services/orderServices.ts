import { OrderStatuses } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { snap } from "../utils/midtrans";
import { GetUserCartService } from "./cartServices";
import { sendOrderStatusUpdateEmail } from "../helper/emailSender";

export async function CreateOrderService(
  userId: string,
  fullfillmentType: string,
  addressId: string | null,
  totalCheckoutPrice: number
) {
  try {
    const cart = await GetUserCartService(userId);

    if (!cart?.items.length) throw new Error("Cart is empty");

    let newOrder;

    if (fullfillmentType === "DELIVERY") {
      if (!addressId)
        throw new Error("Shipping address is required for delivery");

      newOrder = await prisma.$transaction(async (tx) => {
        const order = await prisma.orders.create({
          data: {
            userId: cart.userId,
            totalAmount: totalCheckoutPrice,
            totalWeight: cart.totalWeight,
            fulfillmentType: "DELIVERY",
            paymentMethod: "ONLINE",
            addressId,
            status: "PENDING",
          },
        });
        // 2. Create OrderItem records from CartItems
        const orderItemsData = cart.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.product.price, // Lock in the price
        }));
        await tx.orderItems.createMany({ data: orderItemsData });
        // 3. Clear the user's cart
        await tx.cartItems.deleteMany({ where: { cartId: cart.id } });
        //   4. Update product stock levels
        for (const item of cart.items) {
          await tx.products.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        return order;
      });
    } else {
      // Logic for pickup can be added here
      newOrder = await prisma.$transaction(async (tx) => {
        const order = await prisma.orders.create({
          data: {
            userId: cart.userId,
            totalAmount: totalCheckoutPrice,
            totalWeight: cart.totalWeight,
            fulfillmentType: "PICKUP",
            paymentMethod: "INSTORE",
            addressId: null,
            status: "PENDING",
          },
        });
        // 2. Create OrderItem records from CartItems
        const orderItemsData = cart.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.product.price, // Lock in the price
        }));
        await tx.orderItems.createMany({ data: orderItemsData });
        // 3. Clear the user's cart
        await tx.cartItems.deleteMany({ where: { cartId: cart.id } });
        //   4. Update product stock levels
        for (const item of cart.items) {
          await tx.products.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        return order;
      });
    }
    // 3. Define the transaction parameters
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error("User not found");

    const parameter = {
      transaction_details: {
        order_id: newOrder.id, // Must be a unique order ID
        gross_amount: newOrder.totalAmount,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
    };

    // 4. Create the Midtrans transaction
    const transaction = await snap.createTransaction(parameter);

    if (!transaction) throw new Error("Failed to create transaction");
    // 5. Extract the payment token from the response
    const paymentToken = transaction.token;

    console.log("Midtrans transaction:", transaction);

    return { newOrder, paymentToken };
  } catch (err) {
    throw err;
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
    throw error;
  }
}

export async function GetOrderItemsByOrderIdService(orderId: string) {
  try {
    const orderItems = await prisma.orderItems.findMany({
      where: {
        orderId,
      },
      include: {
        product: true,
      },
    });
    return orderItems;
  } catch (err) {
    throw err;
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
    throw err;
  }
}

export async function GetAllOrderService() {
  try {
    const orders = await prisma.orders.findMany({
      include: { user: true },
    });
    return orders;
  } catch (err) {
    throw err;
  }
}
