import { Router } from "express";
import { RoleGuard, VerifyToken } from "../middlewares/authMiddlewares.ts";
import { CreateOrderController, GetAllOrderController, GetOrderItemsByOrderIdController, GetUserOrdersController, UpdateOrderStatusController } from "../controllers/orderControllers.ts";

const router = Router();

router.get("/", VerifyToken, RoleGuard, GetAllOrderController)
router.get("/:userId", VerifyToken, GetUserOrdersController)
router.get("/order-items/:orderId", VerifyToken, GetOrderItemsByOrderIdController)
router.post("/", VerifyToken, CreateOrderController);
router.patch("/:id", VerifyToken, UpdateOrderStatusController);

export default router;
