import { Request, Response, NextFunction } from "express";
import { GetSubDistrictsByDistrictService } from "../services/subDistrictService";

export async function GetSubDistrictsByDistrictController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const city = req.query.city as string;
    const province = req.query.province as string;
    const district = req.query.district as string;

    const districts = await GetSubDistrictsByDistrictService(province, city, district);

    res.status(200).send({
      message: `Get sub-districts by district success`,
      data: districts,
    });
  } catch (err) {
    next(err);
  }
}
