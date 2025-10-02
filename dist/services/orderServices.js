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
exports.CreateOrderService = CreateOrderService;
exports.UpdateOrderStatusService = UpdateOrderStatusService;
exports.GetOrderItemsByOrderIdService = GetOrderItemsByOrderIdService;
exports.GetUserOrdersService = GetUserOrdersService;
exports.GetAllOrderService = GetAllOrderService;
const prisma_1 = require("../lib/prisma");
const midtrans_1 = require("../utils/midtrans");
const cartServices_1 = require("./cartServices");
const emailSender_1 = require("../helper/emailSender");
function CreateOrderService(userId, fullfillmentType, addressId, totalCheckoutPrice) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cart = yield (0, cartServices_1.GetUserCartService)(userId);
            if (!(cart === null || cart === void 0 ? void 0 : cart.items.length))
                throw new Error("Cart is empty");
            let newOrder;
            if (fullfillmentType === "DELIVERY") {
                if (!addressId)
                    throw new Error("Shipping address is required for delivery");
                newOrder = yield prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const order = yield prisma_1.prisma.orders.create({
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
                    yield tx.orderItems.createMany({ data: orderItemsData });
                    // 3. Clear the user's cart
                    yield tx.cartItems.deleteMany({ where: { cartId: cart.id } });
                    //   4. Update product stock levels
                    for (const item of cart.items) {
                        yield tx.products.update({
                            where: { id: item.productId },
                            data: { stock: { decrement: item.quantity } },
                        });
                    }
                    return order;
                }));
            }
            else {
                // Logic for pickup can be added here
                newOrder = yield prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const order = yield prisma_1.prisma.orders.create({
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
                    yield tx.orderItems.createMany({ data: orderItemsData });
                    // 3. Clear the user's cart
                    yield tx.cartItems.deleteMany({ where: { cartId: cart.id } });
                    //   4. Update product stock levels
                    for (const item of cart.items) {
                        yield tx.products.update({
                            where: { id: item.productId },
                            data: { stock: { decrement: item.quantity } },
                        });
                    }
                    return order;
                }));
            }
            // 3. Define the transaction parameters
            const user = yield prisma_1.prisma.users.findUnique({
                where: { id: userId },
            });
            if (!user)
                throw new Error("User not found");
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
            const transaction = yield midtrans_1.snap.createTransaction(parameter);
            if (!transaction)
                throw new Error("Failed to create transaction");
            // 5. Extract the payment token from the response
            const paymentToken = transaction.token;
            console.log("Midtrans transaction:", transaction);
            return { newOrder, paymentToken };
        }
        catch (err) {
            throw err;
        }
    });
}
function UpdateOrderStatusService(orderId, status) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedOrder = yield prisma_1.prisma.orders.update({
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
            (0, emailSender_1.sendOrderStatusUpdateEmail)(updatedOrder);
            return updatedOrder;
        }
        catch (error) {
            throw error;
        }
    });
}
function GetOrderItemsByOrderIdService(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orderItems = yield prisma_1.prisma.orderItems.findMany({
                where: {
                    orderId,
                },
                include: {
                    product: true,
                },
            });
            return orderItems;
        }
        catch (err) {
            throw err;
        }
    });
}
function GetUserOrdersService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orders = yield prisma_1.prisma.orders.findMany({
                where: {
                    userId,
                },
            });
            return orders;
        }
        catch (err) {
            throw err;
        }
    });
}
function GetAllOrderService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orders = yield prisma_1.prisma.orders.findMany({
                include: { user: true },
            });
            return orders;
        }
        catch (err) {
            throw err;
        }
    });
}
//# sourceMappingURL=orderServices.js.map