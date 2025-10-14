import axios from "axios";
import { RAJAONGKIR_API_KEY, RAJAONGKIR_BASE_URL } from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { GetUserCartService } from "../services/cartServices";
import { redis } from "../lib/redis";

export async function getShippingCost(addressId: string, totalWeight: number) {
  try {
    const address = await prisma.addresses.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    const { district, subdistrict } = address;

    const cart = await GetUserCartService(address.userId);

    if (!cart?.items.length) throw new AppError("Cart is empty", 404);

    const cachedValue = await redis.get(`${district.toLowerCase()}_sub_districts`);
    if (!cachedValue) throw new AppError("Can not get subdistricts", 500);

    const subDistricts = JSON.parse(cachedValue);

    const subDistrictsId = subDistricts.find((sub: any) => sub.name === subdistrict ).id;

    const data = {
      origin: 987,
      destination: subDistrictsId,
      weight: totalWeight * 1000, // must be in grams
      courier: "jne:jnt:pos",
      price: "lowest",
    };

    const config = {
      headers: {
        accept: "application/json",
        key: RAJAONGKIR_API_KEY,
        "content-type": "application/x-www-form-urlencoded",
      },
    };

    const response = await axios.post(
      `${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`,
      data,
      config
    );
    
    return response.data.data;
  } catch (error) {
    throw error;
  }
}
