import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  // Add any other fields from your IRegister interface
});

export const LoginSchema = z.object({
  email: z.email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Create types from schemas to use in your services/controllers
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
