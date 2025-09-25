import { Router } from "express";
import { GetAllProvincesController } from "../controllers/province.controller.ts";
const router = Router();

// read
router.get("/", GetAllProvincesController);

export default router;
