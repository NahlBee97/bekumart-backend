import z from "zod";

export const districtQuerySchema = z.object({
  query: z.object({
    city: z.string().min(1, "kota wajib ada"),
    province: z.string().min(1, "provinsi wajib ada"),
  }),
});

export const salesSummarySchema = z.object({
  query: z.object({
    value: z.string("Should be a string").optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    sort: z
      .enum(["price_asc", "price_desc", "name_asc", "name_desc"])
      .optional(),
  }),
});

export const subDistrictQuerySchema = z.object({
  query: z.object({
    city: z.string().min(1, "Kota wajib diisi"),
    province: z.string().min(1, "Provinsi wajib diisi"),
    district: z.string().min(1, "Kecamatan wajib diisi"),
  }),
});