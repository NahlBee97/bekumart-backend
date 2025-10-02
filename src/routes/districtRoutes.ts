import { Router } from "express";
import { GetDistrictsByCityController } from "../controllers/districtController";
const router = Router();

// read
router.get("/", GetDistrictsByCityController);

export default router;
