import { getPublicIdFromUrl } from "../helper/fileUploadHelper";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import cloudinary from "../utils/cloudinary";

export async function GetProductPhotosService(productId: string) {
  try {
    const photos = await prisma.productPhotos.findMany({
      where: { productId },
    });

    return photos;
  } catch (error) {
    throw new AppError("can not get photos", 500);
  }
}

export async function SetDefaultProductPhotoService(
  photoId: string,
  isDefault: boolean
) {
  const photo = await prisma.productPhotos.findUnique({
    where: {
      id: photoId,
    },
  });

  if (!photo) throw new AppError("Product photo not found", 404);


  const newPhoto = await prisma.$transaction(async (tx) => {
    await tx.productPhotos.updateMany({
      where: { productId: photo.productId },
      data: { isDefault: false },
    });

    const updatedPhoto = await tx.productPhotos.update({
      where: { id: photoId },
      data: {
        isDefault,
      },
    });
    return updatedPhoto;
  });

  if (!newPhoto) throw new AppError("can not set photo to default", 500);

  return newPhoto;
}

export async function UpdateProductPhotoService(
  fileUri: string,
  photoId: string
) {
  try {
    const existingProductPhoto = await prisma.productPhotos.findUnique({
      where: { id: photoId },
    });
    if (!existingProductPhoto) throw new AppError("Product not found", 404);

    let publicId = `products/product_${photoId}_${Date.now()}`; // Default for new images

    if (existingProductPhoto.imageUrl) {
      const existingPublicId = getPublicIdFromUrl(
        existingProductPhoto.imageUrl
      );
      if (existingPublicId) {
        publicId = existingPublicId; // Use existing public_id to overwrite
      }
    }

    // Upload the image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileUri, {
      public_id: publicId,
      overwrite: true,
      folder: "products",
    });

    const imageUrl = uploadResult.secure_url;

    await prisma.productPhotos.update({
      where: { id: photoId },
      data: { imageUrl },
    });

    return imageUrl;
  } catch (error) {
    throw new AppError("can not upload image", 500);
  }
}

export async function AddProductPhotoService(
  fileUri: string,
  productId: string
) {
  const existingProduct = await prisma.products.findUnique({
    where: { id: productId },
  });
  if (!existingProduct) throw new AppError("Product not found", 404);

  let publicId = `products/product_${productId}_${Date.now()}`; // Default for new images

  // Upload the image to Cloudinary
  const uploadResult = await cloudinary.uploader.upload(fileUri, {
    public_id: publicId,
    overwrite: true,
    folder: "products",
  });

  const imageUrl = uploadResult.secure_url;

  const newPhoto = await prisma.productPhotos.create({
    data: { imageUrl, productId, updatedAt: new Date() },
  });

  if (!newPhoto) throw new AppError("can not upload new photo", 500);

  return newPhoto;
}

export async function DeleteProductPhotoService(photoId: string) {
  try {
    const deletedPhoto = await prisma.productPhotos.delete({
      where: { id: photoId },
    });
    return deletedPhoto;
  } catch (error) {
    throw new AppError("can not delete photo", 500);
  }
}
