import { Request, Response, NextFunction } from "express";
import { RegisterSchema, LoginSchema } from "../schemas/authSchemas";
import {
  LoginService,
  RegisterService,
  SetPasswordService,
} from "../services/authServices";
import type { ILogin, IRegister } from "../interfaces/authInterfaces";
import { AppError } from "../utils/appError";
import { VerifyResetPasswordEmail } from "../helper/emailSender";

export async function RegisterController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userData: IRegister = RegisterSchema.parse(req.body);

    const newUser = await RegisterService(userData);

    res
      .status(201)
      .json({ message: `New user created successfully`, data: newUser });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function LoginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userData: ILogin = LoginSchema.parse(req.body);

    const user = await LoginService(userData);

    res.status(200).json({ message: `Login successfully`, data: user });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function VerifyResetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    await VerifyResetPasswordEmail(email);
    res.status(200).json({ message: `Send email success` });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function SetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { password, token } = req.body;
    await SetPasswordService(password, token);
    res.status(200).json({ message: `Set password success` });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
