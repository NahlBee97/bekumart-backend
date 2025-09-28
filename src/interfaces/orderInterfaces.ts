import type { FulfillmentTypes, OrderStatuses, PaymentMethod } from "@prisma/client";
import type { IUser } from "./authInterfaces.ts";
import type { IProduct } from "./productInterface.ts";

// Corresponds to the 'Orders' model
export interface IOrder {
  id: string;
  userId: string;
  user: IUser;
  items: IOrderItem[];
  totalAmount: number;
  totalWeight: number;
  status: OrderStatuses;
  fulfillmentType: FulfillmentTypes;
  paymentMethod: PaymentMethod;
  addressId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Corresponds to the 'OrderItems' model
export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: IProduct;
  quantity: number;
  priceAtPurchase: number;
}
