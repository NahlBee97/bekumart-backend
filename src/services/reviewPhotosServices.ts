import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

export async function GetReviewPhotosService(reviewId: string) {
  const reviewPhotos = await prisma.reviewPhotos.findMany({
    where: { reviewId },
  });

  if (!reviewPhotos) throw new AppError("Review Photos Not Found", 404);

  return reviewPhotos;
}
