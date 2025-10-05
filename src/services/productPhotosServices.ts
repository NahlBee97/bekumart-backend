import { getPublicIdFromUrl } from "../helper/fileUploadHelper";
import { prisma } from "../lib/prisma";
import cloudinary from "../utils/cloudinary";

export async function GetProductPhotosService(productId: string) {
  try {
    const photos = await prisma.productPhotos.findMany({
      where: { productId }
    });
    return photos;
  } catch (err) {
    throw err;
  }
}

export async function SetDefaultProductPhotoService(
  photoId: string,
  isDefault: boolean
) {
  try {
    const photo = await prisma.productPhotos.findUnique({
      where: {
        id: photoId,
      },
    });

    if (!photo) throw new Error("Product photo not found");

    await prisma.productPhotos.updateMany({
      data: { isDefault: false },
    });

    const updatedPhoto = await prisma.productPhotos.update({
      where: { id: photoId },
      data: {
        isDefault,
      },
    });

    return updatedPhoto;
  } catch (error) {
    throw error;
  }
}

export async function UpdateProductPhotoService(
  fileUri: string,
  photoId: string
) {
  try {
    const existingProductPhoto = await prisma.productPhotos.findUnique({
      where: { id: photoId },
    });
    if (!existingProductPhoto) throw new Error("Product not found");

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
  } catch (err) {
    throw err;
  }
}

export async function AddProductPhotoService(
  fileUri: string,
  productId: string
) {
  try {
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) throw new Error("Product not found");

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

    return newPhoto;
  } catch (err) {
    throw err;
  }
}

export async function DeleteProductPhotoService(photoId: string) {
  try {
    const deletedPhoto = await prisma.productPhotos.delete({
      where: { id: photoId },
    });
    return deletedPhoto;
  } catch (err) {
    throw err;
  }
}
