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
exports.default = GetShippingCostController;
const shippingCostServices_1 = require("../services/shippingCostServices");
function GetShippingCostController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const addressId = req.params.addressId;
            const shippingCost = yield (0, shippingCostServices_1.GetShippingCostService)(addressId);
            return res.status(200).json({ shippingCost });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=shippingCostController.js.map