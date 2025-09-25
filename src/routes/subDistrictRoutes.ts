import { Router } from "express";
import { GetSubDistrictsByDistrictController } from "../controllers/subDistrictControllers.ts";
const router = Router();

// read
router.get("/", GetSubDistrictsByDistrictController);

export default router;
