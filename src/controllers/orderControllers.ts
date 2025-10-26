import { Request, Response, NextFunction } from "express";
import {
  CreateOrderService,
  GetAllOrderService,
  GetOrderItemsByOrderIdService,
  GetUserOrdersService,
  UpdateOrderStatusService,
} from "../services/orderServices";
import { AppError } from "../utils/appError";
import { createPaymentTransaction } from "../helper/orderHelpers";
import { OrderStatuses } from "@prisma/client";

export async function CreateOrderController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      userId,
      fullfillmentType,
      courier,
      paymentMethod,
      addressId,
      totalCheckoutPrice,
    } = req.body;

    const newOrderData = await CreateOrderService(
      userId,
      fullfillmentType,
      paymentMethod,
      courier,
      addressId,
      totalCheckoutPrice
    );

    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrderData });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function PaymentTokenController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {order} = req.body;

    const paymentToken = await createPaymentTransaction(order);
    res
      .status(201)
      .json({ message: "Payment token created successfully", paymentToken });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
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

    res.status(200).json({
      message: "Order status updated successfully",
      updatedOrder,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
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

    res
      .status(200)
      .json({ message: "Order items retrives successfully", orderItems });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
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
      .json({ message: "Get user orders successfully", orders });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function GetAllOrderController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const orders = await GetAllOrderService(req.query.status as OrderStatuses);

    res
      .status(200)
      .json({ message: "Get all orders successfully", orders });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
