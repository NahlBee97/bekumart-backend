import { Request, Response, NextFunction } from "express";
import { GetSubDistrictsByDistrictService } from "../services/subDistrictService";
import { AppError } from "../utils/appError";

export async function GetSubDistrictsByDistrictController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const city = req.query.city as string;
    const province = req.query.province as string;
    const district = req.query.district as string;

    const districts = await GetSubDistrictsByDistrictService(
      province,
      city,
      district
    );

    res.status(200).json({
      message: `Get sub-districts by district success`,
      data: districts,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
