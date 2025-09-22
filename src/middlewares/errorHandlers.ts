// src/middlewares/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

// A more specific error class for your application
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle Zod validation errors (the updated way)
  if (err instanceof ZodError) {
    // Process the issues to create a cleaner error object
    const formattedErrors = err.issues.reduce((acc, issue) => {
      const path = issue.path.join(".");
      if (!acc[path]) {
        acc[path] = [];
      }
      acc[path].push(issue.message);
      return acc;
    }, {} as Record<string, string[]>);

    return res.status(400).json({
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Handle all other generic errors
  return res.status(500).json({
    message: "An unexpected internal server error occurred.",
  });
};
