import { IAddress } from "../interfaces/addressesInterface";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

export async function GetAddressesByUserIdService(userId: string) {
  try {
    const addresses = await prisma.addresses.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" }
    });
    return addresses;
  } catch (error) {
    console.error("can not get addresses:", error)
    throw new AppError("Can not get addresses", 500);
  }
}

export async function EditAddressByIdService(
  addressId: string,
  addressData: IAddress
) {
  try {
    const existingAddress = await prisma.addresses.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress) throw new AppError("Address not found.", 404);

    // Update address
    const updatedAddress = await prisma.addresses.update({
      where: { id: addressId },
      data: {
        street: addressData.street ?? existingAddress.street,
        subdistrict: addressData.subdistrict ?? existingAddress.subdistrict,
        district: addressData.district ?? existingAddress.district,
        city: addressData.city ?? existingAddress.city,
        province: addressData.province ?? existingAddress.province,
        postalCode: addressData.postalCode ?? existingAddress.postalCode,
        phone: addressData.phone ?? existingAddress.phone,
      },
    });

    return updatedAddress;
  } catch (error) {
    console.error("Could not update address:", error);
    throw new AppError("Could not update address.", 500);
  }
}

export async function SetDefaultAddressService(
  addressId: string,
  userId: string,
  isDefault: boolean
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const address = await tx.addresses.findUnique({
        where: {
          id: addressId,
          userId: userId,
        },
      });

      if (!address) {
        throw new AppError("Address not found", 404);
      }

      await tx.addresses.updateMany({
        where: {
          userId,
        },
        data: { isDefault: false },
      });

      const updatedAddress = await tx.addresses.update({
        where: { id: addressId },
        data: { isDefault },
      });

      return updatedAddress;
    });

    return result;
  } catch (error) {
    console.error("Error setting address to default:", error);
    throw new AppError("Could not set default address.", 500);
  }
}
export async function DeleteAddressByIdService(addressId: string) {
  try {
    const address = await prisma.addresses.findUnique({
      where: {
        id: addressId,
      },
    });

    if (!address) throw new Error("Address not found");

    await prisma.addresses.delete({
      where: { id: addressId },
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    throw new AppError("Could not delete address", 500)
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
