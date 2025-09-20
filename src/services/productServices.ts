import type { INewProduct, IUpdateProduct } from "../interfaces/productInterface.ts";
import prisma from "../lib/prisma.ts";

export async function GetProductsService() {
  try {
    const products = await prisma.products.findMany();
    return products;
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
      imageUrl,
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
        imageUrl: imageUrl || existingProduct.imageUrl,
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