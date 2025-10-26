import { Router } from "express";
import { GetCitiesByProvinceController } from "../controllers/cityController";
import { validateRequest } from "../middlewares/validationMiddleware";
import { provinceParamSchema } from "../schemas/paramsSchemas";

const router = Router();

router.get(
  "/:province",
  validateRequest(provinceParamSchema),
  GetCitiesByProvinceController
);

export default router;
