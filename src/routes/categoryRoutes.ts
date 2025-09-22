import { Router } from "express";
import GetCategoriesController from "../controllers/categoryControllers.ts";

const router = Router();

router.get("/", GetCategoriesController);

export default router;
