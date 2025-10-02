import { Router } from "express";
import { GetAllProvincesController } from "../controllers/provinceController";
const router = Router();

// read
router.get("/", GetAllProvincesController);

export default router;
