import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import SalesSummaryService from "../services/dashboardServices";

export async function SalesSummaryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const salesSummary = await SalesSummaryService();
    res
      .status(200)
      .json({ message: "Sales data retrieved successfully", salesSummary });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}