import { Request, Response, NextFunction } from "express";
import { INewProduct, IUpdateProduct } from "../interfaces/productInterface";
import { CreateProductSchema, UpdateProductSchema } from "../schemas/productSchemas";
import { bufferToDataURI } from "../helper/fileUploadHelper";
import { CreateProductService, DeleteProductService, GetProductByIdService, GetProductsService, UpdateProductService } from "../services/productServices";

export async function GetProductsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const products = await GetProductsService();
    res.status(200).send({ message: "Products retrieved successfully", data: products });
  } catch (err) {
    next(err);
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
    res.status(200).send({ message: "Product retrieved successfully", data: product });
  } catch (err) {
    next(err);
  }
}

export async function CreateProductController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productData: INewProduct = CreateProductSchema.parse(req.body);
    const newProduct = await CreateProductService(productData);
    res.status(200).send({ message: "Product created successfully", data: newProduct });
  } catch (err) {
    next(err);
  }
}

export async function UpdateProductController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.id as string;
    const productData: IUpdateProduct = UpdateProductSchema.parse(req.body);
    const updatedProduct = await UpdateProductService(productId, productData);
    res.status(200).send({ message: "Product updated successfully", data: updatedProduct });
  } catch (err) {
    next(err);
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
    res.status(200).send({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
}
