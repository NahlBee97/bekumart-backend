import axios from "axios";
import { IAddress } from "../interfaces/addressesInterface";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { geocodeAddress } from "../helper/geocodeAddress";

export async function GetAddressesByUserIdService(userId: string) {
  try {
    const addresses = await prisma.addresses.findMany({
      where: { userId },
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

    let latitude = existingAddress.latitude;
    let longitude = existingAddress.longitude;

    const needsGeocoding =
      addressData.subdistrict || addressData.district || addressData.city;

    if (needsGeocoding) {
      const coords = await geocodeAddress({
        subdistrict: addressData.subdistrict ?? existingAddress.subdistrict,
        district: addressData.district ?? existingAddress.district,
        city: addressData.city ?? existingAddress.city,
      });

      latitude = coords.latitude;
      longitude = coords.longitude;
    }

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
        latitude,
        longitude,
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
    const { subdistrict, district, city } = bodyData;

    const addressDetailData = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${subdistrict}%20${district}%20${city}&format=jsonv2&addressdetails=1&countrycodes=id`
    );

    if (addressDetailData.data.lenght === 0)
      throw new Error("Can not get the coordinates");

    const latitude = Number(addressDetailData.data[0].lat);
    const longitude = Number(addressDetailData.data[0].lon);

    const address = await prisma.addresses.create({
      data: {
        ...bodyData,
        userId,
        latitude,
        longitude,
      },
    });
    return address;
  } catch (error) {
    throw error;
  }
}
