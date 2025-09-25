import type { Request, Response, NextFunction } from "express";
import { GetAddressesByUserIdService } from "../services/addressServices.ts";

export async function GetAddressesByUserIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.userId as string;
    const addresses = await GetAddressesByUserIdService(userId);
    res.status(200).send({ message: "Addresses retrieved successfully", data: addresses });
  } catch (error) {
    next(error);
  }
}
