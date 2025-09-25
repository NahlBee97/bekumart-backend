import { Router } from "express";
import { GetDistrictsByCityController } from "../controllers/district.controller.ts";
const router = Router();

// read
router.get("/", GetDistrictsByCityController);

export default router;
