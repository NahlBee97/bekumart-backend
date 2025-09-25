import type { Request, Response, NextFunction } from "express";
import { GetCitiesByProvinceService } from "../services/city.service.ts";


export async function GetCitiesByProvinceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { province } = req.params as { province: string };

    const cities = await GetCitiesByProvinceService(province);

    res.status(200).send({
      message: `Get cities by province success`,
      data: cities,
    });
  } catch (err) {
    next(err);
  }
}