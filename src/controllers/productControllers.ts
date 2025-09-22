import type { Request, Response, NextFunction } from "express";
import { CreateProductService, DeleteProductService, GetProductsService, UpdateProductPhotoService, UpdateProductService } from "../services/productServices.ts";
import type { INewProduct, IUpdateProduct } from "../interfaces/productInterface.ts";
import { CreateProductSchema, UpdateProductSchema } from "../schemas/productSchemas.ts";
import { bufferToDataURI } from "../helper/fileUploadHelper.ts";

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

export async function UpdateProductPhotoController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.id as string;
    const { file } = req;

    if (!file) throw new Error("File not found");

    // 2. Convert the file buffer to a Data URI
    const fileUri = bufferToDataURI(file.buffer, file.mimetype);

    const imageUrl = await UpdateProductPhotoService(fileUri, productId);

    res.status(200).send({
      message: `Image uploaded and URL saved successfully!`,
      data: imageUrl,
    });
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
