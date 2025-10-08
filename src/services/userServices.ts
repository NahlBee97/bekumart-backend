import bcrypt from "bcryptjs";
import { JWT_SECRET } from "../config";
import { getPublicIdFromUrl } from "../helper/fileUploadHelper";
import { prisma } from "../lib/prisma";
import cloudinary from "../utils/cloudinary";
import { sign } from "jsonwebtoken";
import { AppError } from "../utils/appError";

export async function UploadProfileService(userId: string, fileUri: string) {
  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new AppError("User not found", 404);

  let publicId = `profile/profile_${userId}_${Date.now()}`; // Default for new images

  if (user.imageUrl) {
    const existingPublicId = getPublicIdFromUrl(user.imageUrl);
    if (existingPublicId) {
      publicId = existingPublicId; // Use existing public_id to overwrite
    }
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(fileUri, {
      public_id: publicId,
      overwrite: true,
      folder: "profiles",
    });

    const imageUrl = uploadResult.secure_url;

    await prisma.users.update({
      where: { id: userId },
      data: { imageUrl },
    });
  } catch (error) {
    throw new AppError("can not upload image", 500);
  }
}

export async function GetUserInfoService(userId: string) {
  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new Error("user not found");

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
    imageUrl: user.imageUrl,
  };

  const token = sign(payload, String(JWT_SECRET), { expiresIn: "1h" });

  if (!token) throw new AppError("fail to generate token", 500);

  return token;
}

export async function EditUserInfoService(
  userId: string,
  userData: { name: string; email: string }
) {
  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new Error("User not found");

  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: {
      name: userData.name || user.name,
      email: userData.email || user.email,
    },
  });

  if (!updatedUser) throw new AppError("failed to update user", 500);

  return updatedUser;
}

export async function ChangeUserPasswordService(
  userId: string,
  newPassword: string
) {
  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new Error("User not found");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  if (!hashedPassword) throw new AppError("failed to hash password", 500);

  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  if (!updatedUser) throw new AppError("Failed to update password", 500);

  return updatedUser;
}
