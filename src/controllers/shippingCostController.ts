import { Request, Response, NextFunction } from "express";
import { GetShippingCostService } from "../services/shippingCostServices";
import { AppError } from "../utils/appError";

export default async function GetShippingCostController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { addressId, totalWeight } = req.body;
    const couriers = await GetShippingCostService(addressId, totalWeight);

    return res
      .status(200)
      .json({ message: "successfully calculate shipping cost", couriers });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
