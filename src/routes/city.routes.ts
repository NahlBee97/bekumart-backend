import { Router } from "express";
import { GetCitiesByProvinceController } from "../controllers/city.controller.ts";
const router = Router();

// read
router.get("/:province", GetCitiesByProvinceController);

export default router;
