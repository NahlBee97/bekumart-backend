import axios from "axios";
import { getCityId } from "./city.service";
import { redis } from "../lib/redis";
import { RAJAONGKIR_API_KEY, RAJAONGKIR_BASE_URL } from "../config";

export async function fetchDistrictsByCity(province: string, city: string) {
  try {
    const cityId = await getCityId(province, city);

    const cachedValue = await redis.get(`${city.toLowerCase()}_districts`);

    if (cachedValue) {
      return JSON.parse(cachedValue);
    }

    const response = await axios.get(
      `${RAJAONGKIR_BASE_URL}/destination/district/${cityId}`,
      {
        headers: { accept: "application/json", key: RAJAONGKIR_API_KEY },
      }
    );

    const districts = response.data.data;

    redis.set(`${city.toLowerCase()}_districts`, JSON.stringify(districts));

    return districts;
  } catch (err) {
    throw err;
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
  } catch (err) {
    throw err;
  }
}

export async function GetDistrictsByCityService(
  province: string,
  city: string
) {
  try {
    const districts = await fetchDistrictsByCity(province, city);

    return districts;
  } catch (err) {
    throw err;
  }
}
