import { Request, Response, NextFunction } from "express";
import { bufferToDataURI } from "../helper/fileUploadHelper";
import { AddProductPhotoService, DeleteProductPhotoService, GetProductPhotosService, SetDefaultProductPhotoService, UpdateProductPhotoService } from "../services/productPhotosServices";

export async function GetProductPhotosController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.id as string;
    const photos = await GetProductPhotosService(productId);
    res
      .status(200)
      .send({ message: "Product photos retrieved successfully", data: photos });
  } catch (err) {
    next(err);
  }
}

export async function SetDefaultProductPhotoController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.id as string;
    const isDefault = req.body;
    const updatedPhoto = await SetDefaultProductPhotoService(productId, isDefault);
    res
      .status(200)
      .send({ message: "Product photo updated successfully", data: updatedPhoto });
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
    const photoId = req.params.id as string;
    const { file } = req;

    if (!file) throw new Error("File not found");

    // 2. Convert the file buffer to a Data URI
    const fileUri = bufferToDataURI(file.buffer, file.mimetype);

    const imageUrl = await UpdateProductPhotoService(fileUri, photoId);

    res.status(200).send({
      message: `Image uploaded and URL saved successfully!`,
      data: imageUrl,
    });
  } catch (err) {
    next(err);
  }
}

export async function AddProductPhotoController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.productId as string;
    const { file } = req;

    if (!file) throw new Error("File not found");

    // 2. Convert the file buffer to a Data URI
    const fileUri = bufferToDataURI(file.buffer, file.mimetype);

    const newPhoto = await AddProductPhotoService(fileUri, productId);

    res.status(200).send({
      message: `Image uploaded and URL saved successfully!`,
      data: newPhoto,
    });
  } catch (err) {
    next(err);
  }
}

export async function DeleteProductPhotoController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.id as string;

    const deletedPhoto = await DeleteProductPhotoService(productId);

    res.status(200).send({
      message: `Image deleted successfully!`,
      data: deletedPhoto,
    });
  } catch (err) {
    next(err);
  }
}
