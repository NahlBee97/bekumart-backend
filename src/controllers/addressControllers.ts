import { Request, Response, NextFunction } from "express";
import {
  CreateAddressService,
  DeleteAddressByIdService,
  EditAddressByIdService,
  GetAddressesByUserIdService,
  SetDefaultAddressService,
} from "../services/addressServices";
import { AppError } from "../utils/appError";

export async function GetAddressesByUserIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.userId as string;
    const addresses = await GetAddressesByUserIdService(userId);
    res
      .status(200)
      .json({ message: "Addresses retrieved successfully", addresses });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function EditAddressByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const addressId = req.params.id as string;
    const addressData = req.body;

    const updatedAddress = await EditAddressByIdService(addressId, addressData);
    res
      .status(200)
      .json({ message: "Edit Address successfully", data: updatedAddress });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function SetDefaultAddressController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const addressId = req.params.id as string;
    const userId = req.user?.id as string;
    const updatedAddress = await SetDefaultAddressService(addressId, userId);
    res.status(200).json({
      message: "Set default address successfully",
      data: updatedAddress,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function DeleteAddressByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const addressId = req.params.id as string;
    await DeleteAddressByIdService(addressId);
    res.status(200).json({ message: "Delete Address successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function CreateAddressController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const bodyData = req.body;
    const { userId } = req.body;
    const address = await CreateAddressService(userId, bodyData);
    res
      .status(201)
      .json({ message: "Create Address successfully", data: address });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
