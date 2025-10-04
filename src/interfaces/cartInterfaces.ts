import type { IUser } from "./authInterfaces.ts";
import type { IProduct } from "./productInterface.ts";

export interface IAddItem {
  userId: string;
  productId: string;
  quantity: number;
}

// Corresponds to the 'Carts' model
export interface ICart {
  id: string;
  userId: string;
  user: IUser;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Corresponds to the 'CartItems' model
export interface ICartItem {
  id: string;
  cartId: string;
  productId: string;
  product: IProduct;
  quantity: number;
}