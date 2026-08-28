import { Router } from "express";
import { RoleGuard, VerifyToken } from "../middlewares/authMiddlewares";
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


// Listing every order in the system is an admin-only operation.
router.get("/", VerifyToken, RoleGuard, GetAllOrderController);
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
