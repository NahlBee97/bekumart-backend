import axios from "axios";
import { RAJAONGKIR_API_KEY, RAJAONGKIR_BASE_URL } from "../config";
import { getProvinceId } from "./provinceServices";
import { redis } from "../lib/redis";
import { AppError } from "../utils/appError";

export async function fetchCitiesByProvince(province: string) {
  try {
    const provinceId = await getProvinceId(province);

    if (!provinceId) {
      throw new AppError(`Province '${province}' not found`, 404);
    }

    const cacheKey = `${province.toLowerCase().trim()}_cities`;
    const cachedValue = await redis.get(cacheKey);

    if (cachedValue) {
      return JSON.parse(cachedValue);
    }

    const response = await axios.get(
      `${RAJAONGKIR_BASE_URL}/destination/city/${provinceId}`,
      {
        headers: {
          accept: "application/json",
          key: RAJAONGKIR_API_KEY,
        },
      }
    );

    const cities = response?.data.data;

    if (!cities) throw new AppError("Failed to get cities", 500);

    if (cities.length > 0) {
      await redis.setex(
        cacheKey,
        259200, // 1 hour TTL
        JSON.stringify(cities)
      );
    }

    return cities;
  } catch (error) {
    throw error;
  }
}

export async function getCityId(province: string, city: string) {
  try {
    const cities = await fetchCitiesByProvince(province);

    const matchingCity = cities.find(
      (c: { name: string }) => c.name.toLowerCase() === city.toLowerCase()
    );

    return matchingCity ? matchingCity.id : null;
  } catch (error) {
    throw error;
  }
}

export async function GetCitiesByProvinceService(province: string) {
  try {
    const cities = await fetchCitiesByProvince(province);

    return cities;
  } catch (error) {
    throw error;
  }
}
