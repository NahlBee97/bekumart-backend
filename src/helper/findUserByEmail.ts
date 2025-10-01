import { prisma } from "../lib/prisma";

export async function FindUserByEmail(email: string) {
  try {
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    return user;
  } catch (err) {
    throw err;
  }
}