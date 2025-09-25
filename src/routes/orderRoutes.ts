import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares.ts";
import CreateOrderController from "../controllers/orderControllers.ts";

const router = Router();

router.post("/", VerifyToken, CreateOrderController);

export default router;
