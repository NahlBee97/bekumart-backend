import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.ts";
import type { IUserReqParam } from "../custom.js";

export async function VerifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new Error("Unauthorized");

    const verifyUser = jwt.verify(token, String(JWT_SECRET));

    if (!verifyUser) throw new Error("Invalid Token");

    req.user = verifyUser as IUserReqParam;

    next();
  } catch (err) {
    next(err);
  }
}

export const RoleGuard = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role !== "ADMIN") throw new Error("Restricted");

      next();
    } catch (err) {
      next(err);
    }
  };
};
