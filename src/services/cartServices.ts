import prisma from "../lib/prisma.ts";

export async function GetUserCartService(userId: string) {
  try {
    const cart = await prisma.carts.findFirst({
      where: { userId },
      include: {
        items: {
          // You might want to include product details here as well
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error("Cart not found for user");
    }

    // Calculate total quantity and price using reduce
    const totals = cart.items.reduce(
      (acc, item) => {
        acc.totalQuantity += item.quantity;
        // Ensure you have the price on the cart item or product relation
        acc.totalPrice += item.quantity * item.product.price;
        return acc;
      },
      { totalQuantity: 0, totalPrice: 0 } // Initial values
    );

    // Return the original cart data along with the calculated totals
    return {
      ...cart,
      totalQuantity: totals.totalQuantity,
      totalPrice: totals.totalPrice,
    };
  } catch (err) {
    throw err;
  }
}

export async function AddItemToCartService(userId: string, productId: string) {
  try {
    // Find the user's cart
    const cart = await prisma.carts.findFirst({
      where: { userId },
      include: { items: true }, // Include items in the cart
    });
    if (!cart) throw new Error("Cart not found for user");

    // Check if the item already exists in the cart
    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      // If it exists, update the quantity
      await prisma.cartItems.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 },
      });
    } else {
      const newItem = await prisma.cartItems.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: 1, // Default to 1 for new items
        },
      });

      return { ...cart, items: [...cart.items, newItem] };
    }
  } catch (err) {
    throw err;
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

    // Update the item quantity
    const updatedItem = await prisma.cartItems.update({
      where: { id: cartItem.id },
      data: { quantity },
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
