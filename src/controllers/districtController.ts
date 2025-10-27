import { Request, Response, NextFunction } from "express";
import { GetDistrictsByCityService } from "../services/districtServices";
import { AppError } from "../utils/appError";

export async function GetDistrictsByCityController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const city = req.query.city as string;
    const province = req.query.province as string;

    const districts = await GetDistrictsByCityService(province, city);

    res.status(200).json({
      message: `Get districts by city success`,
      districts,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
