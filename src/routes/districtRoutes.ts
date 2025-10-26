import { Router } from "express";
import { GetDistrictsByCityController } from "../controllers/districtController";
import { validateRequest } from "../middlewares/validationMiddleware";
import { districtQuerySchema } from "../schemas/querySchemas";

const router = Router();

router.get(
  "/",
  validateRequest(districtQuerySchema),
  GetDistrictsByCityController
);

export default router;
