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

    const cacheKey = `${city.toLowerCase().trim()}_cities`;
    const cachedValue = await redis.get(cacheKey);

    if (cachedValue) {
      return JSON.parse(cachedValue);
    }

    const response = await axios.get(
      `${RAJAONGKIR_BASE_URL}/destination/sub-district/${districtId}`,
      {
        headers: { accept: "application/json", key: RAJAONGKIR_API_KEY },
      }
    );

    const subDistricts = response.data.data;

    if (subDistricts.length === 0)
      throw new AppError("can not get subdistricts", 500);

    await redis.setex(cacheKey, 259200, JSON.stringify(subDistricts));

    return subDistricts;
  } catch (error) {
    throw error;
  }
}
