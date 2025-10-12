import axios from "axios";

import { redis } from "../lib/redis";
import { RAJAONGKIR_API_KEY, RAJAONGKIR_BASE_URL } from "../config";
import { AppError } from "../utils/appError";

export async function fetchProvince() {
  try {
    let cachedValue;
    try {
      cachedValue = await redis.get("provinces");
      if (cachedValue) {
        return JSON.parse(cachedValue);
      }
    } catch (error) {
      console.warn("Redis cache unavailable, proceeding without cache:", error);
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
    if (!provinces) throw new AppError("Failed to get provinces", 500);

    if (provinces.length > 0) {
      try {
        await redis.setex("provinces", 259200, JSON.stringify(provinces));
      } catch (error) {
        console.warn("Failed to cache provinces:", error);
      }
    }

    return provinces;
  } catch (error) {
    console.error("Error fetching provinces:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      switch (status) {
        case 400:
          throw new AppError(
            `Invalid request to provinces API: ${message}`,
            400
          );
        case 401:
          throw new AppError("Invalid API key for provinces service", 500);
        case 404:
          throw new AppError("Provinces endpoint not found", 404);
        case 429:
          throw new AppError("Rate limit exceeded for provinces API", 429);
        case 500:
          throw new AppError("Provinces API internal error", 502);
        default:
          if (error.code === "ECONNABORTED") {
            throw new AppError("Provinces API timeout", 504);
          }
          throw new AppError(
            `Provinces service unavailable: ${message}`,
            status || 503
          );
      }
    }

    throw new AppError("Unable to fetch provinces", 500);
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
