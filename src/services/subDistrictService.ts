import axios from "axios";
import { redis } from "../lib/redis.ts";
import { RAJAONGKIR_API_KEY, RAJAONGKIR_BASE_URL } from "../config.ts";
import { getDistrictId } from "./district.service.ts";

export async function GetSubDistrictsByDistrictService(province: string, city: string, district: string) {
  try {
    const districtId = await getDistrictId(province, city, district);

    const cachedValue = await redis.get(`${district.toLowerCase()}_sub_districts`);

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

    redis.set(`${district.toLowerCase()}_sub_districts`, JSON.stringify(subDistricts));

    return subDistricts;
  } catch (err) {
    throw err;
  }
}
