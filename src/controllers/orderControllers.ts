import type { Request, Response, NextFunction } from "express";
import { CreateOrderService, UpdateOrderStatusService } from "../services/orderService.ts";

export async function CreateOrderController(
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

export async function UpdateOrderStatusController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const updatedOrder = await UpdateOrderStatusService(id, status);

    res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
  } catch (error) {
    next(error);
  }
}
