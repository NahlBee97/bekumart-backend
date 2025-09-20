import type { Request, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "../config.ts";
import type { IUserReqParam } from "../custom.js";

export async function VerifyToken(
  req: Request,
  next: NextFunction
) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new Error("Unauthorized");

    const verifyUser = verify(token, String(JWT_SECRET));

    if (!verifyUser) throw new Error("Invalid Token");

    req.user = verifyUser as IUserReqParam;

    next();
  } catch (err) {
    next(err);
  }
}

export const RoleGuard = (role: string) => {
  return (req: Request, next: NextFunction) => {
    try {
      if (req.user?.role !== role) throw new Error("Restricted");

      next();
    } catch (err) {
      next(err);
    }
  };
};
