import { Router } from "express";
import GetCategoriesController from "../controllers/categoryControllers";

const router = Router();

router.get("/", GetCategoriesController);

export default router;
