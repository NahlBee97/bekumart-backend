import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { ContactService } from "../services/contactService";

export async function ContactController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await ContactService(req.body);

    return res.status(200).json({ message: "successfully end email" });
  } catch (error) {
    
    next(error);
  }
}
