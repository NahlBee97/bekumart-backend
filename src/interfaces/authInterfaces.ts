import { UserRoles } from "@prisma/client";

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
  password: string | null;
  imageUrl: string | null;
  isVerified: boolean;
  role: UserRoles;
  createdAt: Date;
  updatedAt: Date;
}