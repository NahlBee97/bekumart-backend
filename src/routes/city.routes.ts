import { Router } from "express";
import { GetCitiesByProvinceController } from "../controllers/city.controller";
const router = Router();

// read
router.get("/:province", GetCitiesByProvinceController);

export default router;
