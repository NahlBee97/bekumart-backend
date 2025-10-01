import { Router } from "express";
import { GetSubDistrictsByDistrictController } from "../controllers/subDistrictControllers";
const router = Router();

// read
router.get("/", GetSubDistrictsByDistrictController);

export default router;
