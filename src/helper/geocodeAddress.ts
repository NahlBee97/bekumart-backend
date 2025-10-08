import axios from "axios";
import { AppError } from "../utils/appError";

export async function geocodeAddress(address: {
  subdistrict: string;
  district: string;
  city: string;
}) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limiting

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: `${address.subdistrict}, ${address.district}, ${address.city}`,
          format: "jsonv2",
          countrycodes: "id",
          limit: 1,
        },
      }
    );

    if (!response.data?.[0]?.lat || !response.data?.[0]?.lon) {
      throw new AppError(
        "Could not determine coordinates for the provided address.",
        400
      );
    }

    return {
      latitude: Number(response.data[0].lat),
      longitude: Number(response.data[0].lon),
    };
  } catch (error) {
    throw new AppError(
      "Location service unavailable. Please try again later.",
      503
    );
  }
}
