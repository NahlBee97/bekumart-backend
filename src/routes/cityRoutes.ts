import { Router } from "express";
import { GetCitiesByProvinceController } from "../controllers/cityController";
const router = Router();

// read
router.get("/:province", GetCitiesByProvinceController);

export default router;
