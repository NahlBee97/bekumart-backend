import { UserRoles } from "@prisma/client";
import { IRegister } from "../interfaces/authInterfaces";

export const registrationData: IRegister = {
  name: "nama",
  email: "nama@gmail.com",
  password: "password@123",
};

export const loginData = {
  email: "nama@gmail.com",
  password: "Password@123",
};

export const GoogleLoginData = {
  name: "string",
  email: "nama@gmail.com",
};

export const hashedPassword = "hashedpassword";

export const createdUser = {
  id: "string",
  name: registrationData.name,
  email: registrationData.email,
  password: hashedPassword,
  imageUrl: "image",
  isVerified: false,
  role: UserRoles.CUSTOMER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const createdUserCart = {
  id: "ajakf",
  userId: createdUser.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const existingUser = {
  ...createdUser,
  email: loginData.email,
};

export const accessPayload = {
  id: existingUser.id,
  email: existingUser.email,
  name: existingUser.name,
  role: existingUser.role,
  isVerified: existingUser.isVerified,
  imageUrl: existingUser.imageUrl,
};

export const refreshPayload = {
  id: existingUser.id,
  role: existingUser.role,
};

export const token = "randomstring";
export const accessToken = "randomstring";
export const refreshToken = "randomstring";
export const newPassword = "randomstring";

export const resolvedToken = {
  id: "test",
  userId: "testuser",
  token: refreshToken,
  isValid: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
