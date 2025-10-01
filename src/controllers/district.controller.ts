import { Request, Response, NextFunction } from "express";
import { GetDistrictsByCityService } from "../services/district.service";

export async function GetDistrictsByCityController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const city = req.query.city as string;
    const province = req.query.province as string;

    const districts = await GetDistrictsByCityService(province, city);

    res.status(200).send({
      message: `Get districts by city success`,
      data: districts,
    });
  } catch (err) {
    next(err);
  }
}
