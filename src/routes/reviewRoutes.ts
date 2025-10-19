import { Router } from "express";
import { CreateProductReviewController, GetProductReviewsByUserIdController, GetProductReviewsController } from "../controllers/reviewController";
import { VerifyToken } from "../middlewares/authMiddlewares";

const router = Router();

router.get("/user/:userId", GetProductReviewsByUserIdController);
router.get("/:productId", GetProductReviewsController);
router.post("/:productId", VerifyToken, CreateProductReviewController);

export default router;