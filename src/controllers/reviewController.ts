import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import {
  CreateProductReviewService,
  GetProductReviewsByUserIdService,
  GetProductReviewsService,
  GetUserLikeReviewsService,
  LikeReviewService,
  UnlikeReviewService,
} from "../services/reviewServices";
import { bufferToDataURI } from "../helper/fileUploadHelper";

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
    const { desc, rating } = req.body;
    const { files } = req;
    const userId = req.user?.id as string;

    let fileUris = [];

    if (Array.isArray(files) && files.length > 0) {
      for (const file of files) {
        const fileUri = bufferToDataURI(file.buffer, file.mimetype);
        fileUris.push(fileUri);
      }
    }

    const reviewData = {
      userId,
      desc,
      rating,
      fileUris,
    };

    const review = await CreateProductReviewService(productId, reviewData);

    return res.status(200).json({ message: "successfully retrieved review", review });
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

export async function GetUserLikeReviewsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id as string;

    const likes = await GetUserLikeReviewsService(userId);

    return res
      .status(200)
      .json({ message: "successfully retrieved likes", likes });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
