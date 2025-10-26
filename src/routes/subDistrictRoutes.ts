import { Router } from "express";
import { GetSubDistrictsByDistrictController } from "../controllers/subDistrictControllers";
import { validateRequest } from "../middlewares/validationMiddleware";
import { subDistrictQuerySchema } from "../schemas/querySchemas";

const router = Router();

router.get(
  "/",
  validateRequest(subDistrictQuerySchema),
  GetSubDistrictsByDistrictController
);

export default router;
