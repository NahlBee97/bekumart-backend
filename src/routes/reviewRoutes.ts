import { Router } from "express";
import { CreateProductReviewController, GetProductReviewsByUserIdController, GetProductReviewsController, LikeReviewController, UnlikeReviewController } from "../controllers/reviewController";
import { VerifyToken } from "../middlewares/authMiddlewares";

const router = Router();

router.get("/user/:userId", GetProductReviewsByUserIdController);
router.get("/:productId", GetProductReviewsController);
router.post("/:productId", VerifyToken, CreateProductReviewController);
router.patch("/like", VerifyToken, LikeReviewController);
router.patch("/unlike", VerifyToken, UnlikeReviewController);

export default router;