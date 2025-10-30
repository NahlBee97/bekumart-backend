import cloudinary from "../../utils/cloudinary";
import { getPublicIdFromUrl } from "../../helper/fileUploadHelper";
import { AppError } from "../../utils/appError";

import {
  GetProductPhotosService,
  SetDefaultProductPhotoService,
  UpdateProductPhotoService,
  AddProductPhotoService,
  DeleteProductPhotoService,
} from "../../services/productPhotosServices";
import { mockedPrisma } from "../mockPrisma";

jest.mock("../../utils/cloudinary", () => ({
  uploader: {
    upload: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("../../helper/fileUploadHelper", () => ({
  getPublicIdFromUrl: jest.fn(),
}));

const mockedCloudinaryUpload = cloudinary.uploader.upload as jest.Mock;
const mockedCloudinaryDestroy = cloudinary.uploader.destroy as jest.Mock;
const mockedGetPublicId = getPublicIdFromUrl as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
});

describe("GetProductPhotosService", () => {
  it("should return all photos for a given productId, ordered by creation date", async () => {
    const mockPhotos = [
      { id: "photo-1", productId: "prod-1", createdAt: new Date() },
      { id: "photo-2", productId: "prod-1", createdAt: new Date() },
    ];
    mockedPrisma.productPhotos.findMany.mockResolvedValue(mockPhotos as any);

    const result = await GetProductPhotosService("prod-1");

    expect(result).toEqual(mockPhotos);
    expect(mockedPrisma.productPhotos.findMany).toHaveBeenCalledWith({
      where: { productId: "prod-1" },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("SetDefaultProductPhotoService", () => {
  const mockTx = {
    productPhotos: {
      updateMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPhoto = { id: "photo-1", productId: "prod-1" };
  const mockUpdatedPhoto = {
    id: "photo-1",
    productId: "prod-1",
    isDefault: true,
  };

  beforeEach(() => {
    mockedPrisma.$transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTx as any);
    });

    mockTx.productPhotos.update.mockResolvedValue(mockUpdatedPhoto as any);
  });

  it("should set a photo to default and unset all others for that product", async () => {
    mockedPrisma.productPhotos.findUnique.mockResolvedValue(mockPhoto as any);

    const result = await SetDefaultProductPhotoService("photo-1", true);

    expect(result).toEqual(mockUpdatedPhoto);

    expect(mockedPrisma.productPhotos.findUnique).toHaveBeenCalledWith({
      where: { id: "photo-1" },
    });

    expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(1);

    expect(mockTx.productPhotos.updateMany).toHaveBeenCalledWith({
      where: { productId: "prod-1" },
      data: { isDefault: false },
    });

    expect(mockTx.productPhotos.update).toHaveBeenCalledWith({
      where: { id: "photo-1" },
      data: { isDefault: true },
    });
  });

  it("should throw AppError 404 if the photo is not found", async () => {
    mockedPrisma.productPhotos.findUnique.mockResolvedValue(null);

    await expect(
      SetDefaultProductPhotoService("photo-1", true)
    ).rejects.toThrow(new AppError("Product photo not found", 404));
  });
});

describe("UpdateProductPhotoService", () => {
  const mockUploadResult = { secure_url: "http://new.secure.url/image.jpg" };
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(123456789);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  it("should overwrite an existing image on Cloudinary and update DB", async () => {
    const mockExistingPhoto = {
      id: "photo-1",
      imageUrl: "http://old.url/existing_public_id.jpg",
    };
    mockedPrisma.productPhotos.findUnique.mockResolvedValue(
      mockExistingPhoto as any
    );
    mockedGetPublicId.mockReturnValue("existing_public_id");
    mockedCloudinaryUpload.mockResolvedValue(mockUploadResult);

    const result = await UpdateProductPhotoService("data:uri...", "photo-1");

    expect(result).toBe(mockUploadResult.secure_url);
    expect(mockedGetPublicId).toHaveBeenCalledWith(mockExistingPhoto.imageUrl);
    expect(mockedCloudinaryUpload).toHaveBeenCalledWith("data:uri...", {
      public_id: "existing_public_id",
      overwrite: true,
      folder: "products",
    });
    expect(mockedPrisma.productPhotos.update).toHaveBeenCalledWith({
      where: { id: "photo-1" },
      data: { imageUrl: mockUploadResult.secure_url },
    });
  });

  it("should upload a new image if imageUrl was previously null", async () => {
    const mockExistingPhoto = { id: "photo-1", imageUrl: null }; // ImageUrl is null
    mockedPrisma.productPhotos.findUnique.mockResolvedValue(
      mockExistingPhoto as any
    );
    mockedCloudinaryUpload.mockResolvedValue(mockUploadResult);

    await UpdateProductPhotoService("data:uri...", "photo-1");

    expect(mockedGetPublicId).not.toHaveBeenCalled(); // Should not try to get public_id
    expect(mockedCloudinaryUpload).toHaveBeenCalledWith("data:uri...", {
      public_id: "products/product_photo-1_123456789", // Uses the new default public_id
      overwrite: true,
      folder: "products",
    });
    expect(mockedPrisma.productPhotos.update).toHaveBeenCalledTimes(1);
  });

  it("should throw AppError 404 if product photo not found", async () => {
    mockedPrisma.productPhotos.findUnique.mockResolvedValue(null);
    await expect(
      UpdateProductPhotoService("data:uri...", "photo-1")
    ).rejects.toThrow(new AppError("Product not found", 404));
  });
});

describe("AddProductPhotoService", () => {
  const mockUploadResult = { secure_url: "http://new.secure.url/image.jpg" };
  const mockNewPhoto = {
    id: "new-photo-id",
    imageUrl: mockUploadResult.secure_url,
  };
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(123456789);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  it("should upload an image and create a new product photo record", async () => {
    mockedPrisma.products.findUnique.mockResolvedValue({ id: "prod-1" } as any);
    mockedCloudinaryUpload.mockResolvedValue(mockUploadResult);
    mockedPrisma.productPhotos.create.mockResolvedValue(mockNewPhoto as any);

    const result = await AddProductPhotoService("data:uri...", "prod-1");

    expect(result).toEqual(mockNewPhoto);
    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: "prod-1" },
    });
    expect(mockedCloudinaryUpload).toHaveBeenCalledWith("data:uri...", {
      public_id: "products/product_prod-1_123456789",
      overwrite: true,
      folder: "products",
    });
    expect(mockedPrisma.productPhotos.create).toHaveBeenCalledWith({
      data: {
        imageUrl: mockUploadResult.secure_url,
        productId: "prod-1",
        updatedAt: expect.any(Date), // Check that a date is being set
      },
    });
  });

  it("should throw AppError 404 if product not found", async () => {
    mockedPrisma.products.findUnique.mockResolvedValue(null);
    await expect(
      AddProductPhotoService("data:uri...", "prod-1")
    ).rejects.toThrow(new AppError("Product not found", 404));
  });
});

describe("DeleteProductPhotoService", () => {
  it("should delete photo from DB and Cloudinary if publicId is found", async () => {
    const mockPhoto = {
      id: "photo-1",
      imageUrl: "http://.../folder/my-public-id.jpg",
    };
    mockedPrisma.productPhotos.findUnique.mockResolvedValue(mockPhoto as any);
    mockedGetPublicId.mockReturnValue("folder/my-public-id"); // Helper mengembalikan public_id
    mockedCloudinaryDestroy.mockResolvedValue({ result: "ok" }); // Cloudinary berhasil
    mockedPrisma.productPhotos.delete.mockResolvedValue(mockPhoto as any); // DB delete berhasil

    const result = await DeleteProductPhotoService("photo-1");

    expect(result).toEqual(mockPhoto);
    expect(mockedPrisma.productPhotos.findUnique).toHaveBeenCalledWith({
      where: { id: "photo-1" },
    });
    expect(mockedGetPublicId).toHaveBeenCalledWith(mockPhoto.imageUrl);
    expect(mockedCloudinaryDestroy).toHaveBeenCalledWith("folder/my-public-id");
    expect(mockedPrisma.productPhotos.delete).toHaveBeenCalledWith({
      where: { id: "photo-1" },
    });
  });

  it("should only delete from DB if imageUrl is null", async () => {
    const mockPhoto = { id: "photo-1", imageUrl: null }; // <-- Poin utama
    mockedPrisma.productPhotos.findUnique.mockResolvedValue(mockPhoto as any);
    mockedPrisma.productPhotos.delete.mockResolvedValue(mockPhoto as any);

    await DeleteProductPhotoService("photo-1");

    expect(mockedGetPublicId).not.toHaveBeenCalled();
    expect(mockedCloudinaryDestroy).not.toHaveBeenCalled();
    expect(mockedPrisma.productPhotos.delete).toHaveBeenCalledTimes(1);
  });

  it("should only delete from DB if getPublicIdFromUrl returns null", async () => {
    const mockPhoto = { id: "photo-1", imageUrl: "http://.../url-aneh" };
    mockedPrisma.productPhotos.findUnique.mockResolvedValue(mockPhoto as any);
    mockedGetPublicId.mockReturnValue(null); // <-- Poin utama
    mockedPrisma.productPhotos.delete.mockResolvedValue(mockPhoto as any);

    await DeleteProductPhotoService("photo-1");

    expect(mockedGetPublicId).toHaveBeenCalledWith(mockPhoto.imageUrl);
    expect(mockedCloudinaryDestroy).not.toHaveBeenCalled();
    expect(mockedPrisma.productPhotos.delete).toHaveBeenCalledTimes(1);
  });

  // Test 4: Error Path (Cloudinary Gagal)
  it("should throw error if Cloudinary fails and NOT delete from DB", async () => {
    // 1. Setup
    const mockPhoto = {
      id: "photo-1",
      imageUrl: "http://.../folder/my-public-id.jpg",
    };
    const cloudinaryError = new Error("Cloudinary server error");
    mockedPrisma.productPhotos.findUnique.mockResolvedValue(mockPhoto as any);
    mockedGetPublicId.mockReturnValue("folder/my-public-id");
    mockedCloudinaryDestroy.mockRejectedValue(cloudinaryError); // <-- Cloudinary gagal

    await expect(DeleteProductPhotoService("photo-1")).rejects.toThrow(
      cloudinaryError
    );

    expect(mockedCloudinaryDestroy).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.productPhotos.delete).not.toHaveBeenCalled();
  });

  it("should throw AppError 404 if photo to delete is not found", async () => {
    mockedPrisma.productPhotos.findUnique.mockResolvedValue(null);

    await expect(DeleteProductPhotoService("photo-1")).rejects.toThrow(
      new AppError("Product photo to delete not found", 404)
    );

    expect(mockedCloudinaryDestroy).not.toHaveBeenCalled();
    expect(mockedPrisma.productPhotos.delete).not.toHaveBeenCalled();
  });
});
