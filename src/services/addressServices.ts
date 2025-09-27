import type { IAddress } from "../interfaces/addressesInterface.ts";
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

export async function EditAddressByIdService(
  addressId: string,
  addressData: IAddress
) {
  try {
    const address = await prisma.addresses.findUnique({
      where: {
        id: addressId,
      },
    });

    if (!address) throw new Error("Address not found");

    const updatedAddress = await prisma.addresses.update({
      where: { id: addressId },
      data: {
        id: address.id,
        street: addressData.street || address.street,
        subdistrict: addressData.subdistrict || address.subdistrict,
        district: addressData.district || address.district,
        city: addressData.city || address.city,
        province: addressData.province || address.province,
        postalCode: addressData.postalCode || address.postalCode,
        phone: addressData.phone || address.phone,
      },
    });

    return updatedAddress;
  } catch (error) {
    throw error;
  }
}

export async function SetDefaultAddressService(addressId: string, isDefault: boolean) {
  try {
    const address = await prisma.addresses.findUnique({
      where: {
        id: addressId,
      },
    });

    if (!address) throw new Error("Address not found");

    await prisma.addresses.updateMany({
      data: { isDefault: false },
    });

    const updatedAddress = await prisma.addresses.update({
      where: { id: addressId },
      data: {
        isDefault,
      },
    });

    return updatedAddress;
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

    if (!address) throw new Error("Address not found");

    await prisma.addresses.delete({
      where: { id: addressId },
    });
  } catch (error) {
    throw error;
  }
}
