import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

export async function FindUserByEmail(email: string) {
  try {
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    return user;
  } catch (error) {
    throw new AppError("can not get user", 500);
  }
}