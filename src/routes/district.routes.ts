import { Router } from "express";
import { GetDistrictsByCityController } from "../controllers/district.controller";
const router = Router();

// read
router.get("/", GetDistrictsByCityController);

export default router;
