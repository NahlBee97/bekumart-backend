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
exports.GetUserCartController = GetUserCartController;
exports.AddItemToCartController = AddItemToCartController;
exports.UpdateItemInCartController = UpdateItemInCartController;
exports.DeleteItemInCartController = DeleteItemInCartController;
const cartServices_1 = require("../services/cartServices");
const cartSchemas_1 = require("../schemas/cartSchemas");
function GetUserCartController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const cart = yield (0, cartServices_1.GetUserCartService)(userId);
            res.status(200).send({ message: "User cart retrieved", data: cart });
        }
        catch (err) {
            next(err);
        }
    });
}
function AddItemToCartController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const itemData = cartSchemas_1.AddItemToCartSchema.parse(req.body);
            const { userId, productId } = itemData;
            const cart = yield (0, cartServices_1.AddItemToCartService)(userId, productId);
            res.status(200).send({ message: "Item added to cart successfully", data: cart });
        }
        catch (err) {
            next(err);
        }
    });
}
function UpdateItemInCartController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { itemId } = req.params;
            const { quantity } = req.body;
            const cart = yield (0, cartServices_1.UpdateItemInCartService)(itemId, quantity);
            res.status(200).send({ message: "Item updated in cart successfully", data: cart });
        }
        catch (err) {
            next(err);
        }
    });
}
function DeleteItemInCartController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { itemId } = req.params;
            yield (0, cartServices_1.DeleteItemInCartService)(itemId);
            res.status(200).send({ message: "Item deleted from cart successfully" });
        }
        catch (err) {
            next(err);
        }
    });
}
//# sourceMappingURL=cartControllers.js.map