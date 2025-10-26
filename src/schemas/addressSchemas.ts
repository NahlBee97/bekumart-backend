import { z } from "zod";

export const createAddressSchema = z.object({
  body: z.object({
    street: z.string().min(1, "Alamat jalan wajib diisi"),
    subdistrict: z.string().min(1, "Kelurahan wajib diisi"),
    district: z.string().min(1, "Kecamatan wajib diisi"),
    city: z.string().min(1, "Kota wajib diisi"),
    province: z.string().min(1, "Provinsi wajib diisi"),
    postalCode: z.string().min(1, "Kode pos wajib diisi"),
    phone: z.string().min(1, "Nomor telepon wajib diisi"),
    receiver: z.string().min(1, "Nama penerima wajib diisi"),
    isDefault: z.boolean().optional(),
  }),
});

export const editAddressSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    street: z.string().optional(),
    subdistrict: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    phone: z.string().optional(),
    receiver: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});
