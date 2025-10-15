import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares";
import { CreateOrderController, GetAllOrderController, GetOrderItemsByOrderIdController, GetUserOrdersController, PaymentTokenController, UpdateOrderStatusController } from "../controllers/orderControllers";

const router = Router();

router.get("/", VerifyToken, GetAllOrderController)
router.get("/:userId", VerifyToken, GetUserOrdersController)
router.get("/order-items/:orderId", VerifyToken, GetOrderItemsByOrderIdController)
router.post("/", VerifyToken, CreateOrderController);
router.post("/payment-token", VerifyToken, PaymentTokenController);
router.patch("/:id", VerifyToken, UpdateOrderStatusController);

export default router;
