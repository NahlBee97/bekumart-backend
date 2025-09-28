// Corresponds to the 'Addresses' model
export interface IAddress {
  id: string;
  userId: string;
  street: string;
  subdistrict: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}