import type { Request, Response, NextFunction } from "express";
import { CreateOrderService } from "../services/orderService.ts";

export default async function CreateOrderController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId, fullfillmentType, addressId, totalCheckoutPrice } = req.body;

    const newOrderData = await CreateOrderService(userId, fullfillmentType, addressId, totalCheckoutPrice);

    res.status(200).json({ message: "Order created successfully", order: newOrderData });
  } catch (error) {
    next(error);
  }
}
