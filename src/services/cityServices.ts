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

    let cachedValue;
    try {
      const cacheKey = `${province.toLowerCase().trim()}_cities`;
      cachedValue = await redis.get(cacheKey);

      if (cachedValue) {
        return JSON.parse(cachedValue);
      }
    } catch (cacheError) {
      console.warn("Redis cache error, proceeding without cache:", cacheError);
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

    if(!cities) throw new AppError("Failed to get cities", 500);

    if (cities.length > 0) {
      try {
        const cacheKey = `${province.toLowerCase().trim()}_cities`;
        await redis.setex(
          cacheKey,
          259200, // 1 hour TTL
          JSON.stringify(cities)
        );
        console.log(`Cached ${cities.length} cities for ${province}`);
      } catch (error) {
        console.warn("Failed to cache cities result:", error);
      }
    }

    return cities;
  } catch (error) {
    console.error(`Error fetching cities for province "${province}":`, error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      switch (status) {
        case 400:
          throw new AppError(`Invalid request for cities: ${message}`, 400);
        case 401:
          throw new AppError("Invalid API key for cities service", 500);
        case 404:
          throw new AppError(`Cities not found for province: ${province}`, 404);
        case 429:
          throw new AppError("Rate limit exceeded for cities API", 429);
        default:
          throw new AppError(
            `Cities service unavailable: ${message}`,
            status || 503
          );
      }
    }

    throw new AppError(`Unable to fetch cities for province: ${province}`, 500);
  }
}
export async function getCityId(province: string, city: string) {
  try {
    const cities = await fetchCitiesByProvince(province);

    const matchingCity = cities.find(
      (c: { name: string }) => c.name.toLowerCase() === city.toLowerCase()
    );

    return matchingCity ? matchingCity.id : null;
  } catch (err) {
    throw err;
  }
}

export async function GetCitiesByProvinceService(province: string) {
  try {
    const cities = await fetchCitiesByProvince(province);

    return cities;
  } catch (err) {
    throw err;
  }
}
