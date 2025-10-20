import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { ContactService } from "../services/contactService";

export async function ContactController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, name, message } = req.body;

    const data = {
      email, name, message
    }

    await ContactService(data);

    return res.status(200).json({ message: "successfully end email" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
}
