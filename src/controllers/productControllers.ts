import { Request, Response, NextFunction } from "express";
import { INewProduct, IUpdateProduct } from "../interfaces/productInterface";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "../schemas/productSchemas";
import {
  CreateProductService,
  DeleteProductService,
  GetProductByIdService,
  GetProductsService,
  UpdateProductService,
} from "../services/productServices";
import { AppError } from "../utils/appError";

export async function GetProductsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const products = await GetProductsService(req.query);

    res
      .status(200)
      .json({ message: "Products retrieved successfully", products });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function GetProductsByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.id as string;
    const product = await GetProductByIdService(productId);
    res
      .status(200)
      .json({ message: "Product retrieved successfully", product });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function CreateProductController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productData = req.body as INewProduct;
    const newProduct = await CreateProductService(productData);
    res
      .status(201)
      .json({ message: "Product created successfully", newProduct });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function UpdateProductController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.id as string;
    const productData = req.body as IUpdateProduct;
    const updatedProduct = await UpdateProductService(productId, productData);
    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function DeleteProductController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.id as string;
    await DeleteProductService(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
