import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares.ts";
import GetShippingCostController from "../controllers/shippingCostController.ts";

const router = Router();

router.get("/:addressId", VerifyToken, GetShippingCostController);

export default router;
