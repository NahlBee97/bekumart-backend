import type { Request, Response, NextFunction } from "express";
import { GetShippingCostService } from "../services/shippingCostServices.ts";

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
    next(error);
  }
}
