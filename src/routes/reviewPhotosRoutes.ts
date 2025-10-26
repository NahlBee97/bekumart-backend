import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares";
import { GetReviewPhotosController } from "../controllers/reviewPhotosControllers";
import { validateRequest } from "../middlewares/validationMiddleware";
import { reviewIdParamSchema } from "../schemas/paramsSchemas";

const router = Router()

router.get("/:reviewId", validateRequest(reviewIdParamSchema), VerifyToken, GetReviewPhotosController);

export default router;