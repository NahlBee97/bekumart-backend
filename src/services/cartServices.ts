import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

export async function GetUserCartService(userId: string) {
  const cart = await prisma.carts.findFirst({
    where: { userId },
    include: {
      items: {
        // You might want to include product details here as well
        include: {
          product: {
            include: {
              productPhotos: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    throw new AppError("Cart not found for user", 404);
  }

  // Calculate total quantity and price using reduce
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
}

export async function AddItemToCartService(
  userId: string,
  productId: string,
  quantity: number
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify product availability
      const product = await tx.products.findUnique({
        where: { id: productId },
        select: { id: true, stock: true },
      });

      if (!product) throw new AppError("Product not found.", 404);
      if (product.stock < quantity)
        throw new AppError("Insufficient stock.", 400);

      // 2. Get or create cart
      const cart = await tx.carts.findFirst({
        where: { userId },
        include: { items: true },
      });

      if(!cart) throw new AppError("Cart not found", 404);

      // 3. Upsert cart item
      const existingItem = await tx.cartItems.findFirst({
        where: { cartId: cart.id, productId },
      });

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

      // 4. Return updated cart
      return await tx.carts.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                // Include product details if needed
                select: { name: true, price: true, productPhotos: true },
              },
            },
          },
        },
      });
    });

    return result;
  } catch (error) {
    console.error("Error in AddItemToCartService:", error);
    throw new AppError("Could not add item to cart.", 500);
  }
}

export async function UpdateItemInCartService(
  itemId: string,
  quantity: number
) {
  try {
    // Find the item in the cart
    const cartItem = await prisma.cartItems.findUnique({
      where: { id: itemId },
    });
    if (!cartItem) throw new Error("Item not found in cart");

    const updatedItem = await prisma.cartItems.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    return updatedItem;
  } catch (error) {
    console.error("Can not update item in cart:", error);
    throw new AppError("Could not update item cart.", 500);
  }
}

export async function DeleteItemInCartService(itemId: string) {
  try {
    // Find the item in the cart
    const cartItem = await prisma.cartItems.findUnique({
      where: { id: itemId },
    });
    if (!cartItem) throw new Error("Item not found in cart");

    // Delete the item from the cart
    await prisma.cartItems.delete({
      where: { id: cartItem.id },
    });
  } catch (error) {
    console.error("Can not delete item in cart:", error);
    throw new AppError("Could not delete item to cart.", 500);
  }
}
