import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { IUserReqParam } from "../custom.js";
import { JWT_SECRET } from "../config.ts";

// Custom error class to handle HTTP status codes
class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function VerifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new AppError("Unauthorized: No token provided", 401);
    }

    const decodedPayload = jwt.verify(token, String(JWT_SECRET)) as JwtPayload;

    if (!decodedPayload.id || !decodedPayload.role) {
      throw new AppError("Invalid token: Payload missing required fields", 401);
    }

    req.user = decodedPayload as IUserReqParam;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError("Unauthorized: Token has expired", 401));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Unauthorized: Invalid token", 401));
    }
    next(err);
  }
}

export function RoleGuard(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    return next(
      new AppError(
        "Forbidden: You do not have permission to perform this action",
        403
      )
    );
  }

  next();
}
