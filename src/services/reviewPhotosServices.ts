import { prisma } from "../lib/prisma";

export async function GetReviewPhotosService(reviewId: string) {
  try {
    const reviewPhotos = await prisma.reviewPhotos.findMany({
      where: { reviewId },
      orderBy: { createdAt: "desc" },
    });

    return reviewPhotos;
  } catch (error) {
    throw error;
  }
}
