import { INewProduct, IUpdateProduct } from "../interfaces/productInterface";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

export async function GetProductsService(queries: {
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
}) {
  try {
    const { search, minPrice, maxPrice, rating } = queries;

    // Build where conditions based on available queries
    const whereConditions: any = {
      AND: [] // Using AND to combine all filters
    };

    // Add search condition if provided
    if (search) {
      whereConditions.AND.push({
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            category: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      });
    }

    // Add price range conditions if provided
    if (minPrice) {
      whereConditions.AND.push({
        price: {
          gte: parseInt(minPrice),
        },
      });
    }

    if (maxPrice) {
      whereConditions.AND.push({
        price: {
          lte: parseInt(maxPrice),
        },
      });
    }

    // Add rating condition if provided
    if (rating) {
      whereConditions.AND.push({
        rating: {
          gte: parseFloat(rating),
        },
      });
    }

    // If no filters are applied, remove the AND array
    if (whereConditions.AND.length === 0) {
      delete whereConditions.AND;
    }

    // Get products with all applicable filters
    const products = await prisma.products.findMany({
      where: whereConditions,
      include: {
        productPhotos: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc' // Show newest products first
      },
    });

    if (!products) throw new AppError("Products not found", 404);
    return products;
  } catch (error) {
    throw new AppError("can not get products", 500);
  }
}

export async function GetProductByIdService(productId: string) {
  try {
    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: { category: true },
    });
    if (!product) throw new AppError("Product not found", 404);
    return product;
  } catch (error) {
    throw new AppError("can not get product", 500);
  }
}

export async function CreateProductService(productData: INewProduct) {
  try {
    const newProduct = await prisma.products.create({
      data: productData,
    });
    return newProduct;
  } catch (error) {
    throw new AppError("can not create product", 500);
  }
}

export async function UpdateProductService(
  productId: string,
  productData: IUpdateProduct
) {
  const { name, price, description, stock, weightInKg, categoryId } =
    productData;

  const existingProduct = await prisma.products.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) throw new AppError("Product not found", 404);

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

  if (!updatedProduct) throw new AppError("can not update product", 500);

  return updatedProduct;
}

export async function DeleteProductService(productId: string) {
  try {
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) throw new AppError("Product not found", 404);

    await prisma.$transaction(async (tx) => {
      await tx.cartItems.deleteMany({
        where: { productId },
      });

      await tx.orderItems.deleteMany({
        where: { productId },
      });

      await tx.productPhotos.deleteMany({
        where: { productId },
      });

      await tx.products.delete({
        where: { id: productId },
      });
    });
  } catch (error) {
    throw new AppError("can not delete product", 500);
  }
}
