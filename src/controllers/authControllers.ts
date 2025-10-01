import { Request, Response, NextFunction } from "express";
import {
  RegisterSchema,
  LoginSchema,
} from "../schemas/authSchemas";
import { LoginService, RegisterService } from "../services/authServices";
import type { ILogin, IRegister } from "../interfaces/authInterfaces";

export async function RegisterController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userData: IRegister = RegisterSchema.parse(req.body);

    const newUser = await RegisterService(userData);

    res
      .status(200)
      .send({ message: `New user register success`, data: newUser });
  } catch (err) {
    next(err);
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

    res.status(200).send({ message: `Login success`, data: user });
  } catch (err) {
    next(err);
  }
}
