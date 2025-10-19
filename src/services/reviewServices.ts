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
  reviewData: { userId: string; desc: string; rating: number }
) {
  const { userId, desc, rating } = reviewData;

  const product = await prisma.products.findFirst({
    where: { id: productId },
  });

  if (!product) throw new AppError("Product Not Found", 404);

  const newReview = await prisma.reviews.create({
    data: {
      userId,
      productId,
      desc,
      rating,
      updatedAt: new Date(),
    },
  });

  if (!newReview) throw new AppError("Failed to create new review", 500);

  return newReview;
}

export async function LikeReviewService(reviewId: string, userId: string) {
  const review = await prisma.reviews.findFirst({
    where: { id: reviewId },
  });

  if (!review) throw new AppError("Review Not Found", 404);

  await prisma.reviewLikes.create({
    data: { reviewId, userId },
  });

  const updatedReview = await prisma.reviews.update({
    where: { id: reviewId },
    data: {
      likeCount: (review.likeCount as number) + 1,
    },
  });

  if (!updatedReview) throw new AppError("Failed to like review", 500);

  return updatedReview;
}

export async function UnlikeReviewService(reviewId: string, userId: string) {
  const review = await prisma.reviews.findFirst({
    where: { id: reviewId },
  });

  if (!review) throw new AppError("Review Not Found", 404);

  await prisma.reviewLikes.delete({
    where: {
      userId_reviewId: {
        userId,
        reviewId,
      },
    },
  });

  const updatedReview = await prisma.reviews.update({
    where: { id: reviewId },
    data: {
      likeCount: (review.likeCount as number) - 1,
    },
  });

  if (!updatedReview) throw new AppError("Failed to unlike review", 500);

  return updatedReview;
}
