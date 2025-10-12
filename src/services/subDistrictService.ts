import axios from "axios";
import { redis } from "../lib/redis";
import { RAJAONGKIR_API_KEY, RAJAONGKIR_BASE_URL } from "../config";
import { getDistrictId } from "./districtServices";
import { AppError } from "../utils/appError";

export async function GetSubDistrictsByDistrictService(
  province: string,
  city: string,
  district: string
) {
  try {
    const districtId = await getDistrictId(province, city, district);

    if (!districtId) throw new AppError(`subdistrict not found'`, 404);

    try {
      const cachedValue = await redis.get(`${district.toLowerCase()}_sub_districts`);
      if (cachedValue) {
        return JSON.parse(cachedValue);
      }
    } catch (error) {
      console.warn("Redis cache unavailable, proceeding without cache", error);
    }

    const response = await axios.get(
      `${RAJAONGKIR_BASE_URL}/destination/sub-district/${districtId}`,
      {
        headers: { accept: "application/json", key: RAJAONGKIR_API_KEY },
      }
    );

    const subDistricts = response.data.data;

    if (!subDistricts) throw new AppError("can not get subdistricts", 500);

     if (subDistricts.length > 0) {
       try {
         const cacheKey = `${city.toLowerCase().trim()}_cities`;
         await redis.setex(
           cacheKey,
           259200,
           JSON.stringify(subDistricts)
         );
         console.log(`Cached ${subDistricts.length} subdistricts for ${city}`);
       } catch (error) {
         console.warn("Failed to cache subdistricts result:", error);
       }
     }

    return subDistricts;
  } catch (error) {
    console.error(`Error fetching subdistricts for ${district}:`, error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      switch (status) {
        case 400:
          throw new AppError(`Invalid request for cities: ${message}`, 400);
        case 401:
          throw new AppError("Invalid API key for cities service", 500);
        case 404:
          throw new AppError(`subdistricts not found for district: ${district}`, 404);
        case 429:
          throw new AppError("Rate limit exceeded for cities API", 429);
        default:
          throw new AppError(
            `Cities service unavailable: ${message}`,
            status || 503
          );
      }
    }

    throw new AppError(`Unable to fetch subdistricts for districts: ${district}`, 500);
  }
}
