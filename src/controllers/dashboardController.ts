import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { CustomerInsightsService, CustomerOriginSummaryService, OperationalSummaryService, ProductInsightsService, SalesSummaryService } from "../services/dashboardServices";

export async function SalesSummaryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const value = Number(req.query.value);
    
    const salesSummary = await SalesSummaryService(value);
    res
      .status(200)
      .json({ message: "Sales data retrieved successfully", salesSummary });
  } catch (error) {
    
    next(error);
  }
}

export async function ProductInsightsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productInsights = await ProductInsightsService();
    res
      .status(200)
      .json({ message: "Product insights data retrieved successfully", productInsights });
  } catch (error) {
    
    next(error);
  }
}

export async function CustomerInsightsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const customerInsights = await CustomerInsightsService();
    res
      .status(200)
      .json({ message: "Customer insights data retrieved successfully", customerInsights });
  } catch (error) {
    
    next(error);
  }
}

export async function OperationalSummaryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const operationalSummary = await OperationalSummaryService();
    res
      .status(200)
      .json({
        message: "Operational summary data retrieved successfully",
        operationalSummary,
      });
  } catch (error) {
    
    next(error);
  }
}

export async function CustomerOriginSummaryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const customerOriginSummary = await CustomerOriginSummaryService();
    res
      .status(200)
      .json({
        message: "Customer Origin summary data retrieved successfully",
        summary: customerOriginSummary,
      });
  } catch (error) {
    
    next(error);
  }
}

