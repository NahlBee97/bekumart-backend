import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

export async function GetCategoriesService() {
  try {
    const categories = await prisma.categories.findMany();
    return categories;
  } catch (error) {
    throw new AppError("can not get categories", 500);
  }
}
