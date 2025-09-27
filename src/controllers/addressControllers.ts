import type { Request, Response, NextFunction } from "express";
import { DeleteAddressByIdService, EditAddressByIdService, GetAddressesByUserIdService, SetDefaultAddressService } from "../services/addressServices.ts";

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
      .send({ message: "Addresses retrieved successfully", data: addresses });
  } catch (error) {
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
      .send({ message: "Edit Address successfully", data: updatedAddress });
  } catch (error) {
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
    const { isDefault } = req.body;
    const updatedAddress = await SetDefaultAddressService(addressId, isDefault);
    res
      .status(200)
      .send({
        message: "Set default address successfully",
        data: updatedAddress,
      });
  } catch (error) {
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
    res.status(200).send({ message: "Delete Address successfully" });
  } catch (error) {
    next(error);
  }
}
