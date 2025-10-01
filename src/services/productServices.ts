import { getPublicIdFromUrl } from "../helper/fileUploadHelper";
import { INewProduct, IUpdateProduct } from "../interfaces/productInterface";
import prisma from "../lib/prisma";
import cloudinary from "../utils/cloudinary";

export async function GetProductsService() {
  try {
    const products = await prisma.products.findMany({
      include: { category: true },
    });
    return products;
  } catch (err) {
    throw err;
  }
}

export async function GetProductByIdService(productId: string) {
  try {
    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: { category: true },
    });
    return product;
  } catch (err) {
    throw err;
  }
}

export async function CreateProductService(productData: INewProduct) {
  try {
    const newProduct = await prisma.products.create({
      data: productData,
    });
    return newProduct;
  } catch (err) {
    throw err;
  }
}

export async function UpdateProductService(
  productId: string,
  productData: IUpdateProduct
) {
  try {
    const {
      name,
      price,
      description,
      stock,
      weightInKg,
      categoryId,
    } = productData;

    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) throw new Error("Product not found");

    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        name: name || existingProduct.name,
        price: price || existingProduct.price,
        description: description || existingProduct.description,
        stock: stock || existingProduct.stock,
        weightInKg: weightInKg || existingProduct.weightInKg,
        categoryId: categoryId || existingProduct.categoryId,
      },
    });
    return updatedProduct;
  } catch (err) {
    throw err;
  }
}

export async function UpdateProductPhotoService(
  fileUri: string,
  productId: string
) {
  try {
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) throw new Error("Product not found");

    let publicId = `products/product_${productId}_${Date.now()}`; // Default for new images

    if (existingProduct.imageUrl) {
      const existingPublicId = getPublicIdFromUrl(existingProduct.imageUrl);
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

    await prisma.products.update({
      where: { id: productId },
      data: { imageUrl },
    });

    return imageUrl;
  } catch (err) {
    throw err;
  }
}


export async function DeleteProductService(productId: string) {
  try {
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) throw new Error("Product not found");
    
    await prisma.products.delete({
      where: { id: productId },
    });
  } catch (err) {
    throw err;
  }
}