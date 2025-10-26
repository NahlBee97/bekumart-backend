import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares";
import GetShippingCostController from "../controllers/shippingCostController";
import { validateRequest } from "../middlewares/validationMiddleware";
import { shippingCostSchema } from "../schemas/shippingCostSchemas";

const router = Router();

router.post(
  "/",
  VerifyToken,
  validateRequest(shippingCostSchema),
  GetShippingCostController
);

export default router;
