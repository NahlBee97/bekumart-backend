import { Request, Response, NextFunction } from "express";
import { GetAllProvincesService } from "../services/province.service";

export async function GetAllProvincesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const provinces = await GetAllProvincesService();

    res.status(200).send({
      message: `Get all provinces success`,
      data: provinces,
    });
  } catch (err) {
    next(err);
  }
}