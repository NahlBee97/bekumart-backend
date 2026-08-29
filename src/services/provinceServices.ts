import axios from "axios";

import { cache } from "../lib/cache";
import { RAJAONGKIR_API_KEY, RAJAONGKIR_BASE_URL } from "../config";
import { AppError } from "../utils/appError";

export async function fetchProvince() {
  try {
    const cachedValue = await cache.get("provinces");
    if (cachedValue) {
      return JSON.parse(cachedValue);
    }

    const response = await axios.get(
      `${RAJAONGKIR_BASE_URL}/destination/province`,
      {
        headers: {
          accept: "application/json",
          key: RAJAONGKIR_API_KEY,
        },
      }
    );

    const provinces = response.data.data;

    if (provinces.length === 0)
      throw new AppError("Failed to get provinces", 500);

    await cache.setex("provinces", 259200, JSON.stringify(provinces));

    return provinces;
  } catch (error) {
    throw error;
  }
}

export async function getProvinceId(province: string) {
  try {
    const provinces = await fetchProvince();

    const matchingProvince = provinces.find(
      (p: { name: string }) => p.name.toLowerCase() === province.toLowerCase()
    );

    return matchingProvince ? matchingProvince.id : null;
  } catch (error) {
    throw error;
  }
}

export async function GetAllProvincesService() {
  try {
    const provinces = await fetchProvince();

    return provinces;
  } catch (error) {
    throw error;
  }
}
