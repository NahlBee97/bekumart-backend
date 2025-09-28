import type { UserRoles } from "@prisma/client";
import type { IOrder } from "./orderInterfaces.ts";
import type { IAddress } from "./addressesInterface.ts";
import type { ICart } from "./cartInterfaces.ts";

export interface IRegister {
    name: string;
    email: string;
    password: string;
}

export interface ILogin {
  email: string;
  password: string;
}

// Corresponds to the 'Users' model
export interface IUser {
  id: string;
  email: string;
  name: string;
  password: string;
  imageUrl: string | null;
  isVerified: boolean;
  role: UserRoles;
  createdAt: Date;
  updatedAt: Date;
}