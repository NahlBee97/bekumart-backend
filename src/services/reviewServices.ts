import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

export async function GetProductReviewsService(productId: string) {
  const product = await prisma.products.findFirst({
    where: { id: productId },
  });

  if (!product) throw new AppError("Product Not Found", 404);

  const reviews = await prisma.reviews.findMany({
    where: { productId },
    include: {
      reviewPhotos: true,
      user: true,
    },
  });

  if (!reviews) throw new AppError("Reviews Not Found", 404);

  return reviews;
}

export async function GetProductReviewsByUserIdService(userId: string) {
  const user = await prisma.users.findFirst({
    where: { id: userId },
  });

  if (!user) throw new AppError("User Not Found", 404);

  const reviews = await prisma.reviews.findMany({
    where: { userId },
    include: {
      reviewPhotos: true,
      user: true,
    },
  });

  if (!reviews) throw new AppError("Reviews Not Found", 404);

  return reviews;
}

export async function CreateProductReviewService(
  productId: string,
  reviewData: { userId: string; review: string; rating: number }
) {
  const { userId, review, rating } = reviewData;

  const product = await prisma.products.findFirst({
    where: { id: productId },
  });

  if (!product) throw new AppError("Product Not Found", 404);

  const newReview = await prisma.reviews.create({
    data: {
      userId,
      productId,
      review,
      rating,
      updatedAt: new Date(),
    },
  });

  if (!newReview) throw new AppError("Failed to create new review", 500);

  return newReview;
}
