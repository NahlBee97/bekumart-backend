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
import { prisma } from "../lib/prisma";
import { assertOwnerOrAdmin } from "../utils/ownership";

export async function CreateOrderController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      fullfillmentType,
      courier,
      paymentMethod,
      addressId,
    } = req.body;

    // userId always comes from the verified token, never from the body -
    // otherwise a user could place orders on someone else's behalf, and
    // totalAmount is now fully recomputed server-side (see CreateOrderService).
    const userId = req.user?.id as string;

    const newOrderData = await CreateOrderService(
      userId,
      fullfillmentType,
      paymentMethod,
      courier,
      addressId
    );

    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrderData });
  } catch (error) {
   
    next(error);
  }
}

export async function PaymentTokenController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { orderId } = req.body;

    // Load the order from the DB instead of trusting an order/totalAmount
    // object supplied by the client - otherwise anyone could request a
    // payment token for an arbitrary amount.
    const order = await prisma.orders.findUnique({ where: { id: orderId } });

    if (!order) throw new AppError("Order not found", 404);

    assertOwnerOrAdmin(req, order.userId);

    const paymentToken = await createPaymentTransaction(order);
    res
      .status(201)
      .json({ message: "Payment token created successfully", paymentToken });
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
    const requester = req.user as { id: string; role: string };

    const updatedOrder = await UpdateOrderStatusService(id, status, requester);

    res.status(200).json({
      message: "Order status updated successfully",
      updatedOrder,
    });
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
    const requester = req.user as { id: string; role: string };

    const orderItems = await GetOrderItemsByOrderIdService(orderId, requester);

    res
      .status(200)
      .json({ message: "Order items retrives successfully", orderItems });
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
    assertOwnerOrAdmin(req, userId);

    const orders = await GetUserOrdersService(userId);

    res
      .status(200)
      .json({ message: "Get user orders successfully", orders });
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
    const orders = await GetAllOrderService(req.query.status as OrderStatuses);

    res
      .status(200)
      .json({ message: "Get all orders successfully", orders });
  } catch (error) {
   
    next(error);
  }
}
