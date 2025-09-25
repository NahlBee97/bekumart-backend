import axios from "axios";

import { redis } from "../lib/redis.ts";
import { RAJAONGKIR_API_KEY, RAJAONGKIR_BASE_URL } from "../config.ts";

export async function fetchProvince() {
  try {
    const cachedValue = await redis.get("provinces");

    if (cachedValue) {
      return JSON.parse(cachedValue);
    }

    const response = await axios.get(
      `${RAJAONGKIR_BASE_URL}/destination/province`,
      {
        headers: { accept: "application/json", key: RAJAONGKIR_API_KEY },
      }
    );

    const provinces = response.data.data;

    redis.set("provinces", JSON.stringify(provinces));

    return provinces;
  } catch (err) {
    throw err;
  }
}

export async function getProvinceId(province: string) {
  try {
    const provinces = await fetchProvince();
  
    const matchingProvince = provinces.find(
      (p: { name: string }) => p.name.toLowerCase() === province.toLowerCase()
    );
  
    return matchingProvince ? matchingProvince.id : null;
    
  } catch (err) {
    throw err;
  }
}

export async function GetAllProvincesService() {
  try {
    const provinces = await fetchProvince();

    return provinces;
  } catch (err) {
    throw err;
  }
}
