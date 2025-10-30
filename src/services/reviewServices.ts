import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import cloudinary from "../utils/cloudinary";

export async function GetProductReviewsService(productId: string) {
  try {
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

    return reviews;
  } catch (error) {
    throw error;
  }
}

export async function GetProductReviewsByUserIdService(userId: string) {
  try {
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

    return reviews;
  } catch (error) {
    throw error;
  }
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
  try {
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
        rating: parseFloat(rating),
        updatedAt: new Date(),
      },
    });

    if (!newReview) throw new AppError("Failed to create new review", 500);

    // to update product rating
    await prisma.$transaction(async (tx) => {
      const reviewsRating = await tx.reviews.aggregate({
        where: {
          productId,
        },
        _avg: {
          rating: true,
        },
      });

      await tx.products.update({
        where: {
          id: productId,
        },
        data: {
          rating: reviewsRating._avg.rating,
        },
      });
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
  } catch (error) {
    throw error;
  }
}

export async function LikeReviewService(reviewId: string, userId: string) {
  try {
    const review = await prisma.reviews.findFirst({
      where: { id: reviewId },
    });

    if (!review) throw new AppError("Review Not Found", 404);

    const updatedReview = await prisma.$transaction( async (tx) => {
      await tx.reviewLikes.create({
        data: { reviewId, userId },
      });
  
      return await tx.reviews.update({
        where: { id: reviewId },
        data: {
          likeCount: (review.likeCount ?? 0) + 1,
        },
      });
    })

    return updatedReview;
  } catch (error) {
    throw error;
  }
}

export async function UnlikeReviewService(reviewId: string, userId: string) {
  try {
    const review = await prisma.reviews.findFirst({
      where: { id: reviewId },
    });
  
    if (!review) throw new AppError("Review Not Found", 404);
  
    const updatedReview = await prisma.$transaction( async (tx) => {
      await tx.reviewLikes.delete({
        where: {
          userId_reviewId: {
            userId,
            reviewId,
          },
        },
      });
    
      return await tx.reviews.update({
        where: { id: reviewId },
        data: {
          likeCount: (review.likeCount ?? 1) - 1,
        },
      });
    })
  
    return updatedReview;
  } catch (error) {
    throw error;
  }
}

export async function GetUserLikeReviewsService(userId: string) {
  try {
    const likes = await prisma.reviewLikes.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  
    return likes;
  } catch (error) {
    throw error;
  }
}
