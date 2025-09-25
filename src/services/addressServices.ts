import prisma from "../lib/prisma.ts";

export async function GetAddressesByUserIdService(userId: string) {
  try {
    const addresses = await prisma.addresses.findMany({
      where: { userId },
    });
    return addresses;
  } catch (err) {
    throw err;
  }
}
