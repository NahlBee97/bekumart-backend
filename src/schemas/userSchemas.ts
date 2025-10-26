import { z } from "zod";

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Nama minimal 2 karakter").optional(),
    email: z.email("Email tidak valid").optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  }),
});
