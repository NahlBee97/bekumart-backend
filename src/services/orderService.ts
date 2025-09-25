import prisma from "../lib/prisma.ts";
import { GetUserCartService } from "./cartServices.ts";

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
      return newOrder;
    }
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
    return newOrder;
  } catch (err) {
    throw err;
  }
}
