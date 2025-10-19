import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { CreateProductReviewService, GetProductReviewsByUserIdService, GetProductReviewsService, LikeReviewService, UnlikeReviewService } from "../services/reviewServices";

export async function GetProductReviewsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params;

    const reviews = await GetProductReviewsService(productId);

    return res
      .status(200)
      .json({ message: "successfully retrieved reviews", reviews });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function GetProductReviewsByUserIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = req.params;

    const reviews = await GetProductReviewsByUserIdService(userId);

    return res
      .status(200)
      .json({ message: "successfully retrieved reviews", reviews });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function CreateProductReviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params;
    const reviewData = req.body;

    const review = await CreateProductReviewService(productId, reviewData);

    return res
      .status(200)
      .json({ message: "successfully retrieved review", review });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function LikeReviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { reviewId } = req.body;
    const userId = req.user?.id as string;

    const review = await LikeReviewService(reviewId, userId);

    return res
      .status(200)
      .json({ message: "successfully like a review", review });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function UnlikeReviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { reviewId } = req.body;
    const userId = req.user?.id as string;

    const review = await UnlikeReviewService(reviewId, userId);

    return res
      .status(200)
      .json({ message: "successfully unlike a review", review });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}