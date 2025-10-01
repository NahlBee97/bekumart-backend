import { Request, Response, NextFunction } from "express";
import { CreateOrderService, GetAllOrderService, GetOrderItemsByOrderIdService, GetUserOrdersService, UpdateOrderStatusService } from "../services/orderService";

export async function CreateOrderController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId, fullfillmentType, addressId, totalCheckoutPrice } = req.body;

    const newOrderData = await CreateOrderService(userId, fullfillmentType, addressId, totalCheckoutPrice);

    res.status(200).send({ message: "Order created successfully", order: newOrderData });
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

    res.status(200).send({ message: "Order status updated successfully", order: updatedOrder });
  } catch (error) {
    next(error);
  }
}

export async function GetOrderItemsByOrderIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
try {
    const orderId = req.params.orderId as string;

    const orderItems = await GetOrderItemsByOrderIdService(orderId);

    res.status(200).send({ message: "Order items retrives successfully", data: orderItems });
  } catch (error) {
    next(error);
  }
}

export async function GetUserOrdersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.userId as string;

    const orders = await GetUserOrdersService(userId);

    res
      .status(200)
      .send({ message: "Get user orders successfully", data: orders });
  } catch (error) {
    next(error);
  }
}

export async function GetAllOrderController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const orders = await GetAllOrderService();

    res
      .status(200)
      .send({ message: "Get all orders successfully", data: orders });
  } catch (error) {
    next(error);
  }
}
