"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserCartService = GetUserCartService;
exports.AddItemToCartService = AddItemToCartService;
exports.UpdateItemInCartService = UpdateItemInCartService;
exports.DeleteItemInCartService = DeleteItemInCartService;
const prisma_1 = require("../lib/prisma");
function GetUserCartService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cart = yield prisma_1.prisma.carts.findFirst({
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
            const totals = cart.items.reduce((acc, item) => {
                acc.totalQuantity += item.quantity;
                acc.totalWeight += item.quantity * item.product.weightInKg; // Assuming product has a weight field
                // Ensure you have the price on the cart item or product relation
                acc.totalPrice += item.quantity * item.product.price;
                return acc;
            }, { totalQuantity: 0, totalPrice: 0, totalWeight: 0 } // Initial values
            );
            // Return the original cart data along with the calculated totals
            return Object.assign(Object.assign({}, cart), { totalQuantity: totals.totalQuantity, totalWeight: totals.totalWeight, totalPrice: totals.totalPrice });
        }
        catch (err) {
            throw err;
        }
    });
}
function AddItemToCartService(userId, productId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Find the user's cart
            const cart = yield prisma_1.prisma.carts.findFirst({
                where: { userId },
                include: { items: true }, // Include items in the cart
            });
            if (!cart)
                throw new Error("Cart not found for user");
            // Check if the item already exists in the cart
            const existingItem = cart.items.find((item) => item.productId === productId);
            if (existingItem) {
                // If it exists, update the quantity
                yield prisma_1.prisma.cartItems.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + 1 },
                });
            }
            else {
                const newItem = yield prisma_1.prisma.cartItems.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        quantity: 1, // Default to 1 for new items
                    },
                });
                return Object.assign(Object.assign({}, cart), { items: [...cart.items, newItem] });
            }
        }
        catch (err) {
            throw err;
        }
    });
}
function UpdateItemInCartService(itemId, quantity) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Find the item in the cart
            const cartItem = yield prisma_1.prisma.cartItems.findUnique({
                where: { id: itemId },
            });
            if (!cartItem)
                throw new Error("Item not found in cart");
            // Update the item quantity
            const updatedItem = yield prisma_1.prisma.cartItems.update({
                where: { id: cartItem.id },
                data: { quantity },
            });
            return updatedItem;
        }
        catch (err) {
            throw err;
        }
    });
}
function DeleteItemInCartService(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Find the item in the cart
            const cartItem = yield prisma_1.prisma.cartItems.findUnique({
                where: { id: itemId },
            });
            if (!cartItem)
                throw new Error("Item not found in cart");
            // Delete the item from the cart
            yield prisma_1.prisma.cartItems.delete({
                where: { id: cartItem.id },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
//# sourceMappingURL=cartServices.js.map