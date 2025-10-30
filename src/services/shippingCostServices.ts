import { AppError } from "../utils/appError";
import { getShippingCost } from "../helper/getShippingCost";

export async function GetShippingCostService(
  addressId: string,
  totalWeight: number
) {
  try {
    if (totalWeight > 100) throw new AppError("Order weight is too heavy", 400);

    const couriers = await getShippingCost(addressId, totalWeight);

    if (couriers.length === 0) throw new AppError("Fails to get couriers", 500);

    return couriers;
  } catch (error) {
    throw error;
  }
}
