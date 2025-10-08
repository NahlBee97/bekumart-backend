import { Request, Response, NextFunction } from "express";
import { GetCitiesByProvinceService } from "../services/cityServices";
import { AppError } from "../utils/appError";

export async function GetCitiesByProvinceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { province } = req.params as { province: string };

    const cities = await GetCitiesByProvinceService(province);

    res.status(200).json({
      message: `Get cities by province success`,
      data: cities,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
