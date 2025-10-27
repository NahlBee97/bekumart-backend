import { Request, Response, NextFunction } from "express";
import { GetAllProvincesService } from "../services/provinceServices";
import { AppError } from "../utils/appError";

export async function GetAllProvincesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const provinces = await GetAllProvincesService();

    res.status(200).json({
      message: `Get all provinces success`,
      provinces,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
