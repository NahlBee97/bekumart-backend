import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares";
import { GetReviewPhotosController } from "../controllers/reviewPhotosControllers";

const router = Router()

router.get("/:reviewId", VerifyToken, GetReviewPhotosController);

export default router;