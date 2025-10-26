import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1, "Rating minimal 1").max(5, "Rating maksimal 5"),
    desc: z
      .string()
      .min(10, "Deskripsi minimal 10 karakter")
      .max(1000, "Deskripsi maksimal 1000 karakter"),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z
      .number()
      .min(1, "Rating minimal 1")
      .max(5, "Rating maksimal 5")
      .optional(),
    desc: z
      .string()
      .min(10, "Deskripsi minimal 10 karakter")
      .max(1000, "Deskripsi maksimal 1000 karakter")
      .optional(),
  }),
});

export const toggleReviewLikeSchema = z.object({
  body: z.object({
    reviewId: z.string().min(1, "Review ID wajib diisi"),
  }),
});
