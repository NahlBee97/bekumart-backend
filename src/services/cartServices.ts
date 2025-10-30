import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

export async function GetUserCartService(userId: string) {
  try {
    const cart = await prisma.carts.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                productPhotos: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const totals = cart.items.reduce(
      (acc, item) => {
        acc.totalQuantity += item.quantity;
        acc.totalWeight += item.quantity * item.product.weightInKg;
        acc.totalPrice += item.quantity * item.product.price;
        return acc;
      },
      { totalQuantity: 0, totalPrice: 0, totalWeight: 0 }
    );

    return {
      ...cart,
      totalQuantity: totals.totalQuantity,
      totalWeight: totals.totalWeight,
      totalPrice: totals.totalPrice,
    };
  } catch (error) {
    throw error;
  }
}

export async function AddItemToCartService(
  userId: string,
  productId: string,
  quantity: number
) {
  try {
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, stock: true },
    });

    if (!product) throw new AppError("Product not found.", 404);

    if (product.stock < quantity)
      throw new AppError("Insufficient product stock.", 400);

    const cart = await prisma.carts.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart) throw new AppError("Cart not found", 404);

    const existingItem = await prisma.cartItems.findFirst({
      where: { cartId: cart.id, productId },
    });

    const result = await prisma.$transaction(async (tx) => {
      if (existingItem) {
        await tx.cartItems.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        await tx.cartItems.create({
          data: { cartId: cart.id, productId, quantity },
        });
      }

      return await tx.carts.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, price: true, productPhotos: true },
              },
            },
          },
        },
      });
    });

    return result;
  } catch (error) {
    throw error;
  }
}

export async function UpdateItemInCartService(
  itemId: string,
  quantity: number
) {
  try {
    const cartItem = await prisma.cartItems.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) throw new AppError("Item not found in cart", 404);

    const updatedItem = await prisma.cartItems.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    return updatedItem;
  } catch (error) {
    throw error;
  }
}

export async function DeleteItemInCartService(itemId: string) {
  try {
    const cartItem = await prisma.cartItems.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) throw new AppError("Item not found in cart", 404);

    await prisma.cartItems.delete({
      where: { id: cartItem.id },
    });
  } catch (error) {
    throw error;
  }
}
