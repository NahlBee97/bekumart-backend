import { z } from "zod";

export const RegisterSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.email("Email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        "Password harus mengandung huruf, angka, dan karakter khusus"
      ),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.email("Email tidak valid"),
    password: z.string().min(1, "Password wajib diisi"),
  }),
});

export const GoogleLoginSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.email("Email tidak valid"),
  }),
});

export const ChangePasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token wajib diisi"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        "Password harus mengandung huruf, angka, dan karakter khusus"
      ),
  }),
});

export const VerifyResetPasswordSchema = z.object({
  body: z.object({
    email: z.email("Email tidak valid"),
  }),
});
