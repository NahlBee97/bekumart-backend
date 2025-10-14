import { AppError } from "../utils/appError";
import { getShippingCost } from "../helper/getShippingCost";

export async function GetShippingCostService(
  addressId: string,
  totalWeight: number
) {
  if (totalWeight > 100) throw new AppError("Order weight is too heavy", 400);

  const couriers = await getShippingCost(addressId, totalWeight);

  return couriers;
}
