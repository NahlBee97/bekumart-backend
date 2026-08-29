import axios from "axios";
import { getCityId } from "./cityServices";
import { cache } from "../lib/cache";
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

    cachedValue = await cache.get(cacheKey);
    if (cachedValue) {
      return JSON.parse(cachedValue);
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

    if (!districts) throw new AppError("can not get district", 500);

    if (districts.length > 0) {
      await cache.setex(cacheKey, 259200, JSON.stringify(districts));
    }

    return districts;
  } catch (error) {
    throw error;
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
