import axios from "axios";
import {
  RAJAONGKIR_API_KEY,
  RAJAONGKIR_BASE_URL,
} from "../config";
import { getProvinceId } from "./province.service";
import { redis } from "../lib/redis";

export async function fetchCitiesByProvince(province: string) {
  try {
    const provinceId = await getProvinceId(province);

    const cachedValue = await redis.get(`${province.toLowerCase()}_cities`);

    if (cachedValue) {
      return JSON.parse(cachedValue);
    }

    const response = await axios.get(
      `${RAJAONGKIR_BASE_URL}/destination/city/${provinceId}`,
      {
        headers: { accept: "application/json", key: RAJAONGKIR_API_KEY },
      }
    );

    const cities = response.data.data;

    redis.set(`${province.toLowerCase()}_cities`, JSON.stringify(cities));

    return cities;
  } catch (err) {
    throw err;
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
