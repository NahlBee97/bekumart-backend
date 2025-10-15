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

    const subDistrictId = subDistricts.find((sub: any) => sub.name === subdistrict ).id;

    const data = {
      origin: 987,
      destination: subDistrictId,
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

    const cacheKey = `${subdistrict.toLowerCase().trim()}_couriers_${
      data.weight
    }`;

    try {
      const cachedValue = await redis.get(cacheKey);
      if (cachedValue) {
        return JSON.parse(cachedValue);
      }
    } catch (error) {
      console.warn("Redis cache unavailable, proceeding without cache", error);
    }

    const response = await axios.post(
      `${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`,
      data,
      config
    );

    const couriers = response.data.data;

    if (couriers.length > 0) {
      try {
        const cacheKey = `${subdistrict.toLowerCase().trim()}_couriers_${data.weight}`;
        await redis.setex(cacheKey, 259200, JSON.stringify(couriers));
      } catch (error) {
        console.warn("Failed to cache districts result:", error);
      }
    }
    
    return couriers;
  } catch (error) {
    throw error;
  }
}
