import axios from "axios";
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

    const { subdistrict, district, city } = addressData;

    const addressDetailData = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${subdistrict}%20${district}%20${city}&format=jsonv2&addressdetails=1&countrycodes=id`
    );
    
    if (addressDetailData.data.lenght === 0) throw new Error("Can not get the coordinates");

    const latitude = Number(addressDetailData.data[0].lat);
    const longitude = Number(addressDetailData.data[0].lon);

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
        latitude: latitude || address.latitude,
        longitude: longitude || address.longitude,
      },
    });

    return updatedAddress;
  } catch (error) {
    throw error;
  }
}

export async function SetDefaultAddressService(
  addressId: string,
  isDefault: boolean
) {
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
export async function CreateAddressService(userId: string, bodyData: IAddress) {
  try {
    const { subdistrict, district, city } = bodyData;

    const addressDetailData = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${subdistrict}%20${district}%20${city}&format=jsonv2&addressdetails=1&countrycodes=id`
    );

    if (addressDetailData.data.lenght === 0) throw new Error("Can not get the coordinates");

    const latitude = Number(addressDetailData.data[0].lat);
    const longitude = Number(addressDetailData.data[0].lon);

    const address = await prisma.addresses.create({
      data: {
        ...bodyData,
        userId,
        latitude,
        longitude
      },
    });
    return address;
  } catch (error) {
    throw error;
  }
}
