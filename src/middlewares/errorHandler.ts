import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";

export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let status;
  let message;

  if (error instanceof AppError) {
    status = error.statusCode;
    message = error.message;
  }

  if (error instanceof TokenExpiredError) {
    status = 401;
    message = "Session expired. Please log in again";
  }

  if (error instanceof JsonWebTokenError) {
    status = 401;
    message = "Invalid session token. Please log in again";
  }

  if (error instanceof ZodError) {
    status = 400;
    message = error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  //   rajaongkir errors
  if (axios.isAxiosError(error)) {
    status = error.response?.data.meta.code;
    message = error.response?.data.meta.message;
  }

  console.error({error: true, status, message});

  if (status && message) {
    return res.status(status).json({
      message,
    });
  } else {
    return res.status(500).json({
      message:
        "Internal Server Error, check your connection or try again later",
    });
  }
}
