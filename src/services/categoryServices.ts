import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

export async function GetCategoriesService() {
  try {
    const categories = await prisma.categories.findMany();
    return categories;
  } catch (error) {
    console.error("can not get categories:", error);
    throw new AppError("can not get categories", 500);
  }
}
