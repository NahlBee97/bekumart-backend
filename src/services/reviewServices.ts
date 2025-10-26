import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import cloudinary from "../utils/cloudinary";

export async function GetProductReviewsService(productId: string) {
  // First check if product exists
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
    orderBy: { createdAt: "desc" },
  });

  if (reviews.length === 0) {
    return [];
  }

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
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!reviews) throw new AppError("Reviews Not Found", 404);

  return reviews;
}

export async function CreateProductReviewService(
  productId: string,
  reviewData: {
    userId: string;
    desc: string;
    rating: string;
    fileUris: string[];
  }
) {
  const { userId, desc, rating, fileUris } = reviewData;

  const product = await prisma.products.findFirst({
    where: { id: productId },
  });

  if (!product) throw new AppError("Product Not Found", 404);

  const newReview = await prisma.reviews.create({
    data: {
      userId,
      productId,
      desc,
      rating: parseInt(rating),
      updatedAt: new Date(),
    },
  });

  if (!newReview) throw new AppError("Failed to create new review", 500);

  const reviews = await prisma.reviews.aggregate({
    where: {
      productId,
    },
    _avg: {
      rating: true,
    },
  });

  await prisma.products.update({
    where: {
      id: productId,
    },
    data: {
      rating: reviews._avg.rating,
    },
  });

  if (fileUris.length > 0) {
    let num = 0;

    for (const fileUri of fileUris) {
      num++;
      let publicId = `reviews/review_${newReview.id}_${num}_${Date.now()}`; // Default for new images
      // Upload the image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        public_id: publicId,
        overwrite: true,
        folder: "reviews",
      });

      const imageUrl = uploadResult.secure_url;

      await prisma.reviewPhotos.create({
        data: { imageUrl, reviewId: newReview.id, updatedAt: new Date() },
      });
    }
  }

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

export async function GetUserLikeReviewsService(userId: string) {
  const likes = await prisma.reviewLikes.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!likes) throw new AppError("Likes Not Found", 404);

  return likes;
}
