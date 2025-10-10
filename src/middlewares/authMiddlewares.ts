import { Request, Response, NextFunction } from "express";
import { JsonWebTokenError, JwtPayload, TokenExpiredError, verify } from "jsonwebtoken";
import { IUserReqParam } from "../custom";
import { AppError } from "../utils/appError";
import { JWT_ACCESS_SECRET } from "../config";

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

    const decodedPayload = verify(token, String(JWT_ACCESS_SECRET)) as JwtPayload;

    if (!decodedPayload.id || !decodedPayload.role) {
      throw new AppError("Invalid token: Payload missing required fields", 401);
    }

    req.user = decodedPayload as IUserReqParam;

    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return next(new AppError("Unauthorized: Token has expired", 401));
    }
    if (err instanceof JsonWebTokenError) {
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
