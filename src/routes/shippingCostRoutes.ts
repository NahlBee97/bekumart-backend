import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares";
import GetShippingCostController from "../controllers/shippingCostController";

const router = Router();

router.post("/", VerifyToken, GetShippingCostController);

export default router;
