import { Request, Response, NextFunction } from "express";
import { GetShippingCostService } from "../services/shippingCostServices";
import { AppError } from "../utils/appError";

export default async function GetShippingCostController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const addressId = req.params.addressId as string;

    const shippingCost = await GetShippingCostService(addressId);

    return res.status(200).json({ shippingCost });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
