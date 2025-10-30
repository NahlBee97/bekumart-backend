import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { GetReviewPhotosService } from "../services/reviewPhotosServices";

export async function GetReviewPhotosController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { reviewId } = req.params;

    const reviewPhotos = await GetReviewPhotosService(reviewId as string);

    return res
      .status(200)
      .json({ message: "successfully retrieved review photos", reviewPhotos });
  } catch (error) {
    
    next(error);
  }
}
