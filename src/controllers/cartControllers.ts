import { Request, Response, NextFunction } from "express";
import {
  AddItemToCartService,
  DeleteItemInCartService,
  GetUserCartService,
  UpdateItemInCartService,
} from "../services/cartServices";
import type { IAddItem } from "../interfaces/cartInterfaces";
import { AppError } from "../utils/appError";

export async function GetUserCartController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = req.params;
    const cart = await GetUserCartService(userId);
    res.status(200).json({ message: "User cart retrieved", cart });
  } catch (error) {
    
    next(error);
  }
}

export async function AddItemToCartController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id as string;
    const { productId, quantity } = req.body as IAddItem;

    await AddItemToCartService(userId, productId, quantity);
    res
      .status(200)
      .json({ message: "Item added to cart successfully"});
  } catch (error) {
    
    next(error);
  }
}

export async function UpdateItemInCartController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await UpdateItemInCartService(itemId, quantity);
    res
      .status(200)
      .json({ message: "Item updated in cart successfully", cart });
  } catch (error) {
    
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
    
    next(error);
  }
}
