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
    const { userId } = req.params;
    const addresses = await GetAddressesByUserIdService(userId);
    res
      .status(200)
      .json({ message: "Berhasil mengambil daftar alamat", addresses });
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
    const addressId = req.params.id;
    const addressData = req.body;

    const updatedAddress = await EditAddressByIdService(addressId, addressData);
    res
      .status(200)
      .json({ message: "Berhasil mengubah alamat", updatedAddress });
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
    const addressId = req.params.id;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const updatedAddress = await SetDefaultAddressService(addressId, userId);
    res.status(200).json({
      message: "Berhasil mengatur alamat utama",
      updatedAddress,
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
    const addressId = req.params.id;
    await DeleteAddressByIdService(addressId);
    res.status(200).json({ message: "Berhasil menghapus alamat" });
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
    const addressData = req.body;
    const userId = req.user?.id as string;
    const newAddress = await CreateAddressService(userId, addressData);
    res
      .status(201)
      .json({ message: "Create Address successfully", newAddress });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
