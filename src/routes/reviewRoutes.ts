import { Router } from "express";
import {
  CreateProductReviewController,
  GetProductReviewsByUserIdController,
  GetProductReviewsController,
  GetUserLikeReviewsController,
  LikeReviewController,
  UnlikeReviewController,
} from "../controllers/reviewController";
import { VerifyToken } from "../middlewares/authMiddlewares";
import { upload } from "../middlewares/fileUpload.middleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { productIdParamSchema, userIdParamSchema } from "../schemas/paramsSchemas";
import { createReviewSchema, toggleReviewLikeSchema } from "../schemas/reviewSchemas";

const router = Router();

router.get("/likes", VerifyToken, GetUserLikeReviewsController);
router.get(
  "/:productId",
  validateRequest(productIdParamSchema),
  GetProductReviewsController
);
router.get(
  "/user/:userId",
  validateRequest(userIdParamSchema),
  GetProductReviewsByUserIdController
);
router.post(
  "/:productId",
  VerifyToken,
  upload.array("files"),
  validateRequest(productIdParamSchema),
  validateRequest(createReviewSchema),
  CreateProductReviewController
);
router.patch(
  "/like",
  VerifyToken,
  validateRequest(toggleReviewLikeSchema),
  LikeReviewController
);
router.patch(
  "/unlike",
  VerifyToken,
  validateRequest(toggleReviewLikeSchema),
  UnlikeReviewController
);

export default router;
