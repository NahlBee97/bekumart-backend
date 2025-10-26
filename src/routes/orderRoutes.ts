import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares";
import {
  CreateOrderController,
  GetAllOrderController,
  GetOrderItemsByOrderIdController,
  GetUserOrdersController,
  PaymentTokenController,
  UpdateOrderStatusController,
} from "../controllers/orderControllers";
import { validateRequest } from "../middlewares/validationMiddleware";
import { createOrderSchema, PaymentTokenSchema, updateOrderSchema } from "../schemas/orderSchemas";
import { idParamSchema, orderIdParamSchema, userIdParamSchema } from "../schemas/paramsSchemas";

const router = Router();


router.get("/", VerifyToken, GetAllOrderController);
router.get(
  "/:userId",
  VerifyToken,
  validateRequest(userIdParamSchema),
  GetUserOrdersController
);
router.get(
  "/order-items/:orderId",
  VerifyToken,
  validateRequest(orderIdParamSchema),
  GetOrderItemsByOrderIdController
);
router.post(
  "/",
  VerifyToken,
  validateRequest(createOrderSchema),
  CreateOrderController
);
router.post(
  "/payment-token",
  VerifyToken,
  validateRequest(PaymentTokenSchema),
  PaymentTokenController
);
router.patch(
  "/:id",
  VerifyToken,
  validateRequest(idParamSchema),
  validateRequest(updateOrderSchema),
  UpdateOrderStatusController
);

export default router;
