import { NextFunction, Request, Response } from "express";
import { bufferToDataURI } from "../helper/fileUploadHelper";
import {
  ChangeUserPasswordService,
  EditUserInfoService,
  GetUserInfoService,
  UploadProfileService,
} from "../services/userServices";
import { AppError } from "../utils/appError";

export async function UploadProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.id as string;

    const { file } = req;

    if (!file) throw new AppError("File not found", 400);

    // 2. Convert the file buffer to a Data URI
    const fileUri = bufferToDataURI(file.buffer, file.mimetype);

    await UploadProfileService(userId, fileUri);

    res.status(200).json({
      message: "Upload profile successfully",
    });
  } catch (error) {
    
    next(error);
  }
}

export async function GetUserInfoController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.id as string;

    const user = await GetUserInfoService(userId);

    res.status(200).json({
      message: "Get user successfully",
      user,
    });
  } catch (error) {
    
    next(error);
  }
}

export async function EditUserInfoController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.id as string;
    const userData = req.body;

    const updatedUser = await EditUserInfoService(userId, userData);

    res.status(200).json({
      message: "Edit user successfully",
      updatedUser,
    });
  } catch (error) {
    
    next(error);
  }
}

export async function ChangeUserPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.userId as string;
    const { newPassword } = req.body;

    const updatedUser = await ChangeUserPasswordService(userId, newPassword);

    res.status(200).json({
      message: "Update user password successfully",
      updatedUser,
    });
  } catch (error) {
    
    next(error);
  }
}
