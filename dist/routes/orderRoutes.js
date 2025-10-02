"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const orderControllers_1 = require("../controllers/orderControllers");
const router = (0, express_1.Router)();
router.get("/", authMiddlewares_1.VerifyToken, orderControllers_1.GetAllOrderController);
router.get("/:userId", authMiddlewares_1.VerifyToken, orderControllers_1.GetUserOrdersController);
router.get("/order-items/:orderId", authMiddlewares_1.VerifyToken, orderControllers_1.GetOrderItemsByOrderIdController);
router.post("/", authMiddlewares_1.VerifyToken, orderControllers_1.CreateOrderController);
router.patch("/:id", authMiddlewares_1.VerifyToken, orderControllers_1.UpdateOrderStatusController);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map