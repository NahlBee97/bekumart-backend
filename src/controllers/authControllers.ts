import { Request, Response, NextFunction } from "express";
import {
  CheckService,
  GoogleLoginService,
  LoginService,
  LogOutService,
  RefreshTokenService,
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
    const userData = req.body as IRegister;

    const newUser = await RegisterService(userData);

    res
      .status(201)
      .json({ message: `New user created successfully`, newUser });
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
    const userData = req.body as ILogin;

    const tokens = await LoginService(userData);

    const { accessToken, refreshToken } = tokens;

    const sevenDayInMs = 7 * 24 * 60 * 60 * 1000;

    res
      .status(200)
      .cookie("token", refreshToken, { maxAge: sevenDayInMs, httpOnly: true })
      .json({ message: `Login successfully`, accessToken });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function GoogleLoginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tokens = await GoogleLoginService(req.body);

    const { accessToken, refreshToken } = tokens;

    const sevenDayInMs = 7 * 24 * 60 * 60 * 1000;

    res
      .status(200)
      .cookie("token", refreshToken, { maxAge: sevenDayInMs, httpOnly: true })
      .json({ message: `Login with google successfully`, accessToken });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function LogOutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const refreshToken = req.cookies.token as string;

    if (refreshToken) await LogOutService(refreshToken);

    res
      .status(200)
      .clearCookie("token", { httpOnly: true })
      .json({ message: `Log out successfully` });
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

export async function RefreshTokenController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const refreshToken = req.cookies.token as string;

    if (!refreshToken) {
      return res
        .status(200)
        .json({ message: "no active session", accessToken: null });
    }

    const accessToken = await RefreshTokenService(refreshToken);

    res.status(200).json({
      message: "Refresh token successfully",
      accessToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}

export async function CheckController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const refreshToken = req.cookies.token as string;

    if (!refreshToken) {
      return res.status(200).json({
        message: "Check User Successfully",
        status: { isLoggedIn: false },
      });
    }

    const status = await CheckService(refreshToken);

    res.status(200).json({
      message: "Check User Successfully",
      status,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
