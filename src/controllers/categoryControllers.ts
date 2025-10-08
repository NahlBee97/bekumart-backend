import { Request, Response, NextFunction } from "express";
import { GetCategoriesService } from "../services/categoryServices";
import { AppError } from "../utils/appError";

export default async function GetCategoriesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categories = await GetCategoriesService();
    res.status(200).json({
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
