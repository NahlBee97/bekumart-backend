import { IAddress } from "../interfaces/addressesInterface";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

export async function GetAddressesByUserIdService(userId: string) {
  try {
    const addresses = await prisma.addresses.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return addresses;
  } catch (error) {
    throw error;
  }
}

export async function CreateAddressService(userId: string, bodyData: IAddress) {
  try {
    const address = await prisma.$transaction(async (tx) => {
      await tx.addresses.updateMany({
        where: {
          userId,
        },
        data: { isDefault: false },
      });

      const newdAddress = await tx.addresses.create({
        data: { ...bodyData, userId, isDefault: true, updatedAt: new Date() },
      });

      return newdAddress;
    });

    return address;
  } catch (error) {
    throw error;
  }
}

export async function EditAddressByIdService(
  addressId: string,
  addressData: Partial<IAddress>
) {
  try {
    const existingAddress = await prisma.addresses.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress) {
      throw new AppError("Address not found", 404);
    }

    const updatedAddress = await prisma.addresses.update({
      where: { id: addressId },
      data: {
        receiver: addressData.receiver || existingAddress.receiver,
        street: addressData.street || existingAddress.street,
        subdistrict: addressData.subdistrict || existingAddress.subdistrict,
        district: addressData.district || existingAddress.district,
        city: addressData.city || existingAddress.city,
        province: addressData.province || existingAddress.province,
        postalCode: addressData.postalCode || existingAddress.postalCode,
        phone: addressData.phone || existingAddress.phone,
      },
    });
    return updatedAddress;
  } catch (error) {
    throw error;
  }
}

export async function SetDefaultAddressService(
  addressId: string,
  userId: string
) {
  try {
    const address = await prisma.addresses.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new AppError("Address not found", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.addresses.updateMany({
        where: {
          userId,
          id: { not: addressId },
        },
        data: { isDefault: false },
      });

      const updatedAddress = await tx.addresses.update({
        where: { id: addressId },
        data: { isDefault: true },
      });

      return updatedAddress;
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function DeleteAddressByIdService(addressId: string) {
  try {
    const address = await prisma.addresses.findUnique({
      where: {
        id: addressId,
      },
    });

    if (!address) throw new AppError("Address not found", 404);

    await prisma.addresses.delete({
      where: { id: addressId },
    });
  } catch (error) {
    throw error;
  }
}
