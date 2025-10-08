import { Request, Response, NextFunction } from "express";
import { AddItemToCartService, DeleteItemInCartService, GetUserCartService, UpdateItemInCartService } from "../services/cartServices";
import type { IAddItem } from "../interfaces/cartInterfaces";
import { AddItemToCartSchema } from "../schemas/cartSchemas";
import { AppError } from "../utils/appError";

export async function GetUserCartController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.userId as string;
    const cart = await GetUserCartService(userId);
    res.status(200).json({ message: "User cart retrieved", data: cart });
  } catch (error) {
    if (error instanceof AppError) {
          return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
  }
}

export async function AddItemToCartController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const itemData: IAddItem = AddItemToCartSchema.parse(req.body);

    const { userId, productId, quantity } = itemData;

    const cart = await AddItemToCartService(userId, productId, quantity);
    res.status(200).json({ message: "Item added to cart successfully", data: cart });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function UpdateItemInCartController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { itemId } = req.params as { itemId: string };
    const { quantity } = req.body;

    const cart = await UpdateItemInCartService(itemId, quantity);
    res.status(200).json({ message: "Item updated in cart successfully", data: cart });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function DeleteItemInCartController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { itemId } = req.params as { itemId: string };

    await DeleteItemInCartService(itemId);
    res.status(200).json({ message: "Item deleted from cart successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
