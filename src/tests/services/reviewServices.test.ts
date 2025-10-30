import cloudinary from "../../utils/cloudinary"; 
import { AppError } from "../../utils/appError";

import {
  GetProductReviewsService,
  GetProductReviewsByUserIdService,
  CreateProductReviewService,
  LikeReviewService,
  UnlikeReviewService,
  GetUserLikeReviewsService,
} from '../../services/reviewServices'; 
import { mockedPrisma } from "../mockPrisma";

jest.mock('../../utils/cloudinary', () => ({
  uploader: {
    upload: jest.fn(),
  },
}));

beforeEach(() => {
  jest.resetAllMocks;
});

describe('GetProductReviewsService', () => {
  it('should return reviews for a valid product', async () => {
    const mockProduct = { id: 'prod-1' };
    const mockReviews = [{ id: 'rev-1', desc: 'Great!' }];

    mockedPrisma.products.findFirst.mockResolvedValue(mockProduct as any);
    mockedPrisma.reviews.findMany.mockResolvedValue(mockReviews as any);

    const result = await GetProductReviewsService('prod-1');

    expect(result).toEqual(mockReviews);
    expect(mockedPrisma.products.findFirst).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
    expect(mockedPrisma.reviews.findMany).toHaveBeenCalledWith({
      where: { productId: 'prod-1' },
      include: { reviewPhotos: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should throw 404 if product not found', async () => {
    mockedPrisma.products.findFirst.mockResolvedValue(null);

    await expect(GetProductReviewsService('prod-bad')).rejects.toThrow(
      new AppError('Product Not Found', 404)
    );
    expect(mockedPrisma.reviews.findMany).not.toHaveBeenCalled();
  });
});

describe('GetProductReviewsByUserIdService', () => {
  it('should return reviews for a valid user', async () => {
    const mockUser = { id: 'user-1' };
    const mockReviews = [{ id: 'rev-1', desc: 'My review' }];

    mockedPrisma.users.findFirst.mockResolvedValue(mockUser as any);
    mockedPrisma.reviews.findMany.mockResolvedValue(mockReviews as any);

    const result = await GetProductReviewsByUserIdService('user-1');

    expect(result).toEqual(mockReviews);
    expect(mockedPrisma.users.findFirst).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    expect(mockedPrisma.reviews.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should throw 404 if user not found', async () => {
    mockedPrisma.users.findFirst.mockResolvedValue(null);

    await expect(GetProductReviewsByUserIdService('user-bad')).rejects.toThrow(
      new AppError('User Not Found', 404)
    );
  });
});

describe('CreateProductReviewService', () => {
  let dateNowSpy: jest.SpyInstance;
  const mockTx = {
    reviews: { aggregate: jest.fn() },
    products: { update: jest.fn() },
  };

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(123456789);
    mockedPrisma.$transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTx);
    });
  });

  afterEach(() => {
    dateNowSpy.mockRestore(); // Kembalikan Date.now() ke normal
  });

  const reviewData = {
    userId: 'user-1',
    desc: 'Test review',
    rating: '5',
    fileUris: ['data:uri/image1', 'data:uri/image2'],
  };
  const mockProduct = { id: 'prod-1' };
  const mockNewReview = { id: 'rev-1', ...reviewData, rating: 5 };

  it('should create review, update rating, and upload photos', async () => {
    mockedPrisma.products.findFirst.mockResolvedValue(mockProduct as any);
    mockedPrisma.reviews.create.mockResolvedValue(mockNewReview as any);
    mockTx.reviews.aggregate.mockResolvedValue({ _avg: { rating: 4.8 } });
    (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
      secure_url: 'http://cloudinary.url/image.jpg',
    });

    const result = await CreateProductReviewService('prod-1', reviewData);

    expect(result).toEqual(mockNewReview);
    expect(mockedPrisma.products.findFirst).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
    expect(mockedPrisma.reviews.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        productId: 'prod-1',
        desc: 'Test review',
        rating: 5, 
        updatedAt: expect.any(Date),
      },
    });

    expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.reviews.aggregate).toHaveBeenCalledWith({
      where: { productId: 'prod-1' },
      _avg: { rating: true },
    });
    expect(mockTx.products.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { rating: 4.8 },
    });

    expect(cloudinary.uploader.upload).toHaveBeenCalledTimes(2);
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith('data:uri/image1', {
      public_id: 'reviews/review_rev-1_1_123456789',
      overwrite: true,
      folder: 'reviews',
    });
    expect(mockedPrisma.reviewPhotos.create).toHaveBeenCalledTimes(2);
    expect(mockedPrisma.reviewPhotos.create).toHaveBeenCalledWith({
      data: {
        imageUrl: 'http://cloudinary.url/image.jpg',
        reviewId: 'rev-1',
        updatedAt: expect.any(Date),
      },
    });
  });

  it('should throw 404 if product not found', async () => {
    mockedPrisma.products.findFirst.mockResolvedValue(null);
    await expect(
      CreateProductReviewService('prod-bad', reviewData)
    ).rejects.toThrow(new AppError('Product Not Found', 404));
  });
});

describe('LikeReviewService', () => {
  const mockTx = {
    reviewLikes: { create: jest.fn() },
    reviews: { update: jest.fn() },
  };

  beforeEach(() => {
    mockedPrisma.$transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTx);
    });
  });

  it('should create a like and increment likeCount', async () => {
    const mockReview = { id: 'rev-1', likeCount: 5 }; // Asumsikan likeCount awal adalah 5
    mockedPrisma.reviews.findFirst.mockResolvedValue(mockReview as any);
    mockTx.reviews.update.mockResolvedValue({ ...mockReview, likeCount: 6 });

    await LikeReviewService('rev-1', 'user-1');

    expect(mockTx.reviewLikes.create).toHaveBeenCalledWith({
      data: { reviewId: 'rev-1', userId: 'user-1' },
    });
    expect(mockTx.reviews.update).toHaveBeenCalledWith({
      where: { id: 'rev-1' },
      data: { likeCount: 6 }, // 5 + 1
    });
  });

  it('should throw 404 if review not found', async () => {
    mockedPrisma.reviews.findFirst.mockResolvedValue(null);
    await expect(LikeReviewService('rev-bad', 'user-1')).rejects.toThrow(
      new AppError('Review Not Found', 404)
    );
  });
});

describe('UnlikeReviewService', () => {
  const mockTx = {
    reviewLikes: { delete: jest.fn() },
    reviews: { update: jest.fn() },
  };

  beforeEach(() => {
    mockedPrisma.$transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTx);
    });
  });

  it('should delete a like and decrement likeCount', async () => {
    const mockReview = { id: 'rev-1', likeCount: 5 };
    mockedPrisma.reviews.findFirst.mockResolvedValue(mockReview as any);
    mockTx.reviews.update.mockResolvedValue({ ...mockReview, likeCount: 4 });

    await UnlikeReviewService('rev-1', 'user-1');

    // Verifikasi logika transaksi
    expect(mockTx.reviewLikes.delete).toHaveBeenCalledWith({
      where: {
        userId_reviewId: {
          userId: 'user-1',
          reviewId: 'rev-1',
        },
      },
    });
    expect(mockTx.reviews.update).toHaveBeenCalledWith({
      where: { id: 'rev-1' },
      data: { likeCount: 4 }, // 5 - 1
    });
  });
});

describe('GetUserLikeReviewsService', () => {
  it('should return all likes for a user', async () => {
    const mockLikes = [{ reviewId: 'rev-1', userId: 'user-1' }];
    mockedPrisma.reviewLikes.findMany.mockResolvedValue(mockLikes as any);

    const result = await GetUserLikeReviewsService('user-1');

    expect(result).toEqual(mockLikes);
    expect(mockedPrisma.reviewLikes.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
  });
});