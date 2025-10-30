export interface IAddress {
  id: string;
  receiver: string;
  userId: string;
  street: string;
  subdistrict: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}