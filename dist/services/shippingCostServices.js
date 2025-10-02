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
exports.GetShippingCostService = GetShippingCostService;
const prisma_1 = require("../lib/prisma");
const config_1 = require("../config");
const cartServices_1 = require("./cartServices");
function calculateShippingCost(addressId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Implement your logic to calculate delivery fee based on addressId
        try {
            const shippingAddress = yield prisma_1.prisma.addresses.findUnique({
                where: { id: addressId },
            });
            if (!shippingAddress)
                throw new Error("Address not found");
            const lat2 = shippingAddress.latitude;
            const lon2 = shippingAddress.longitude;
            // origin coordinates (BekuMart HQ)
            const originAddress = yield prisma_1.prisma.addresses.findUnique({
                where: { id: config_1.ORIGIN_ADDRESS_ID },
            });
            if (!originAddress)
                throw new Error("Origin address not found");
            const lat1 = originAddress.latitude;
            const lon1 = originAddress.longitude;
            // Haversine formula to calculate distance between two coordinates
            const R = 6371; // Radius of the Earth in km
            const dLat = ((lat2 - lat1) * Math.PI) / 180;
            const dLon = ((lon2 - lon1) * Math.PI) / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((lat1 * Math.PI) / 180) *
                    Math.cos((lat2 * Math.PI) / 180) *
                    Math.sin(dLon / 2) *
                    Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // Distance in km
            if (distance > 30)
                throw new Error("Delivery address is too far");
            // Calculate delivery fee based on distance
            const deliveryBaseFee = distance * 2500; // Example: 2500 IDR per km
            const markUpDeliveryFee = deliveryBaseFee + deliveryBaseFee * 0.1; // Add 10% markup
            const minDeliveryFee = 10000; // Minimum delivery fee
            const deliveryFee = markUpDeliveryFee < minDeliveryFee ? minDeliveryFee : markUpDeliveryFee;
            return deliveryFee;
        }
        catch (err) {
            throw err;
        }
    });
}
function GetShippingCostService(addressId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch the address details
            const address = yield prisma_1.prisma.addresses.findUnique({
                where: { id: addressId },
            });
            if (!address) {
                throw new Error("Address not found");
            }
            const cart = yield (0, cartServices_1.GetUserCartService)(address.userId);
            if (!(cart === null || cart === void 0 ? void 0 : cart.items.length))
                throw new Error("Cart is empty");
            if (cart.totalWeight > 30)
                throw new Error("Order weight is too heavy");
            // Calculate shipping cost based on address and cart weight
            let shippingCost;
            shippingCost = yield calculateShippingCost(addressId);
            if (cart.totalWeight > 5) {
                shippingCost = shippingCost + shippingCost * 0.1; // Add additional fee for heavy items
            }
            else if (cart.totalWeight > 10) {
                shippingCost = shippingCost + shippingCost * 0.2; // Add additional fee for very heavy items
            }
            else if (cart.totalWeight > 20) {
                shippingCost = shippingCost + shippingCost * 0.3; // Add additional fee for extremely heavy items
            }
            return shippingCost;
        }
        catch (err) {
            throw err;
        }
    });
}
//# sourceMappingURL=shippingCostServices.js.map