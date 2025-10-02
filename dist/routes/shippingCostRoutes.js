"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const shippingCostController_1 = __importDefault(require("../controllers/shippingCostController"));
const router = (0, express_1.Router)();
router.get("/:addressId", authMiddlewares_1.VerifyToken, shippingCostController_1.default);
exports.default = router;
//# sourceMappingURL=shippingCostRoutes.js.map