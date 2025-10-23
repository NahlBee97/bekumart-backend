import { Router } from "express";
import { CreateProductReviewController, GetProductReviewsByUserIdController, GetProductReviewsController, GetUserLikeReviewsController, LikeReviewController, UnlikeReviewController } from "../controllers/reviewController";
import { VerifyToken } from "../middlewares/authMiddlewares";
import { upload } from "../middlewares/fileUpload.middleware";

const router = Router();


router.get("/like", GetUserLikeReviewsController);
router.get("/:productId", GetProductReviewsController);
router.get("/user/:userId", GetProductReviewsByUserIdController);
router.post("/:productId", VerifyToken, upload.array("files"), CreateProductReviewController);
router.patch("/like", VerifyToken, LikeReviewController);
router.patch("/unlike", VerifyToken, UnlikeReviewController);

export default router;