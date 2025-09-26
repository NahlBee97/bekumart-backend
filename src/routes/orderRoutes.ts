import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares.ts";
import { CreateOrderController, UpdateOrderStatusController } from "../controllers/orderControllers.ts";

const router = Router();

router.post("/", VerifyToken, CreateOrderController);
router.patch("/:id", VerifyToken, UpdateOrderStatusController);

export default router;
