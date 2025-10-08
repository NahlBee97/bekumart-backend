import axios from "axios";
import { getCityId } from "./cityServices";
import { redis } from "../lib/redis";
import { RAJAONGKIR_API_KEY, RAJAONGKIR_BASE_URL } from "../config";
import { AppError } from "../utils/appError";

export async function fetchDistrictsByCity(province: string, city: string) {
  try {
    const cityId = await getCityId(province, city);

    if (!cityId) {
      throw new AppError(
        `City '${city}' not found in province '${province}'`,
        404
      );
    }

    const cacheKey = `${city.toLowerCase().trim()}_districts`;
    let cachedValue;

    try {
      cachedValue = await redis.get(cacheKey);
      if (cachedValue) {
        return JSON.parse(cachedValue);
      }
    } catch (error) {
      console.warn("Redis cache unavailable, proceeding without cache", error);
    }

    const response = await axios.get(
      `${RAJAONGKIR_BASE_URL}/destination/district/${cityId}`,
      {
        headers: {
          accept: "application/json",
          key: RAJAONGKIR_API_KEY,
        },
      }
    );

    const districts = response.data.data;

    if(!districts) throw new AppError("can not get district", 500)

    if (districts.length > 0) {
      try {
        const cacheKey = `${city.toLowerCase().trim()}_cities`;
        await redis.setex(
          cacheKey,
          3600, // 1 hour TTL
          JSON.stringify(districts)
        );
        console.log(`Cached ${districts.length} districts for ${city}`);
      } catch (error) {
        console.warn("Failed to cache districts result:", error);
      }
    }

    return districts;
  } catch (error) {
    console.error(`Error fetching districts for ${city}:`, error);

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
export async function getDistrictId(
  province: string,
  city: string,
  district: string
) {
  try {
    const districts = await fetchDistrictsByCity(province, city);

    const matchingDistrict = districts.find(
      (d: { name: string }) => d.name.toLowerCase() === district.toLowerCase()
    );

    return matchingDistrict ? matchingDistrict.id : null;
  } catch (error) {
    throw error;
  }
}

export async function GetDistrictsByCityService(
  province: string,
  city: string
) {
  try {
    const districts = await fetchDistrictsByCity(province, city);

    return districts;
  } catch (error) {
    throw error;
  }
}
