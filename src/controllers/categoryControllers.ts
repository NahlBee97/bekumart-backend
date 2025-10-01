import { Request, Response, NextFunction } from "express";
import { GetCategoriesService } from "../services/categoryServices";

export default async function GetCategoriesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Fetch categories from the database or any data source
    const categories = await GetCategoriesService();
    res.status(200).send({
        message: "Categories fetched successfully",
        data: categories
    });
  } catch (error) {
    next(error);
  }
}
