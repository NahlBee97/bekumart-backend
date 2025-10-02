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
exports.CreateOrderController = CreateOrderController;
exports.UpdateOrderStatusController = UpdateOrderStatusController;
exports.GetOrderItemsByOrderIdController = GetOrderItemsByOrderIdController;
exports.GetUserOrdersController = GetUserOrdersController;
exports.GetAllOrderController = GetAllOrderController;
const orderServices_1 = require("../services/orderServices");
function CreateOrderController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, fullfillmentType, addressId, totalCheckoutPrice } = req.body;
            const newOrderData = yield (0, orderServices_1.CreateOrderService)(userId, fullfillmentType, addressId, totalCheckoutPrice);
            res.status(200).send({ message: "Order created successfully", order: newOrderData });
        }
        catch (error) {
            next(error);
        }
    });
}
function UpdateOrderStatusController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const { status } = req.body;
            const updatedOrder = yield (0, orderServices_1.UpdateOrderStatusService)(id, status);
            res.status(200).send({ message: "Order status updated successfully", order: updatedOrder });
        }
        catch (error) {
            next(error);
        }
    });
}
function GetOrderItemsByOrderIdController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orderId = req.params.orderId;
            const orderItems = yield (0, orderServices_1.GetOrderItemsByOrderIdService)(orderId);
            res.status(200).send({ message: "Order items retrives successfully", data: orderItems });
        }
        catch (error) {
            next(error);
        }
    });
}
function GetUserOrdersController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const orders = yield (0, orderServices_1.GetUserOrdersService)(userId);
            res
                .status(200)
                .send({ message: "Get user orders successfully", data: orders });
        }
        catch (error) {
            next(error);
        }
    });
}
function GetAllOrderController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orders = yield (0, orderServices_1.GetAllOrderService)();
            res
                .status(200)
                .send({ message: "Get all orders successfully", data: orders });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=orderControllers.js.map