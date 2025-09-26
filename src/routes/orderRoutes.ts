import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares.ts";
import { CreateOrderController, GetOrderItemsByOrderIdController, GetUserOrdersController, UpdateOrderStatusController } from "../controllers/orderControllers.ts";

const router = Router();

router.get("/:userId", GetUserOrdersController)
router.get("/order-items/:orderId", GetOrderItemsByOrderIdController)
router.post("/", VerifyToken, CreateOrderController);
// router.patch("/:id", VerifyToken, UpdateOrderStatusController);

export default router;
