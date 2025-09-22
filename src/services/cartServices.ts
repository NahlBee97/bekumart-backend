import prisma from "../lib/prisma.ts";

export async function GetUserCartService(userId: string) {
  try {
    const cart = await prisma.carts.findFirst({
      where: { userId },
      include: { items: true }, // Include items in the cart
    });
    return cart;
  } catch (err) {
    throw err;
  }
}

export async function AddItemToCartService(userId: string, productId: string, quantity: number) {
  try {
    // Find the user's cart
    const cart = await prisma.carts.findFirst({
      where: { userId },
      include: { items: true }, // Include items in the cart
    });
    if (!cart) throw new Error("Cart not found for user");

    // Add item to the cart
    const newItem = await prisma.cartItems.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    return { ...cart, items: [...cart.items, newItem] };
  } catch (err) {
    throw err;
  }
}

export async function UpdateItemInCartService(itemId: string, quantity: number) {
  try {
    // Find the item in the cart
    const cartItem = await prisma.cartItems.findUnique({
      where: { id: itemId },
    });
    if (!cartItem) throw new Error("Item not found in cart");

    // Update the item quantity
    const updatedItem = await prisma.cartItems.update({
      where: { id: cartItem.id },
      data: { quantity: cartItem.quantity + quantity },
    });

    return updatedItem;
  } catch (err) {
    throw err;
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
  } catch (err) {
    throw err;
  }
}
