import bcrypt from "bcryptjs";
import { JWT_SECRET } from "../config";
import { getPublicIdFromUrl } from "../helper/fileUploadHelper";
import { prisma } from "../lib/prisma";
import cloudinary from "../utils/cloudinary";
import { sign } from "jsonwebtoken";

export async function UploadProfileService(userId: string, fileUri: string) {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new Error("User not found");

    let publicId = `profile/profile_${userId}_${Date.now()}`; // Default for new images

    if (user.imageUrl) {
      const existingPublicId = getPublicIdFromUrl(user.imageUrl);
      if (existingPublicId) {
        publicId = existingPublicId; // Use existing public_id to overwrite
      }
    }

    // Upload the image to Cloudinary
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
    throw error;
  }
}

export async function GetUserInfoService(userId: string) {
  try {
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
    return token;
  } catch (error) {
    throw error;
  }
}

export async function EditUserInfoService(
  userId: string,
  userData: { name: string; email: string }
) {
  try {
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

    return updatedUser;
  } catch (error) {
    throw error;
  }
}

export async function ChangeUserPasswordService(
  userId: string,
  newPassword: string
) {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      },
    });

    return updatedUser;
  } catch (error) {
    throw error;
  }
}