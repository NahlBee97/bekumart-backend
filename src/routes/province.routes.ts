import { Router } from "express";
import { GetAllProvincesController } from "../controllers/province.controller";
const router = Router();

// read
router.get("/", GetAllProvincesController);

export default router;
