import { prisma } from "../lib/prisma";
import { ORIGIN_ADDRESS_ID } from "../config";
import { GetUserCartService } from "./cartServices";
import { AppError } from "../utils/appError";

async function calculateShippingCost(addressId: string) {
  // Implement your logic to calculate delivery fee based on addressId
  const shippingAddress = await prisma.addresses.findUnique({
    where: { id: addressId },
  });

  if (!shippingAddress) throw new AppError("Address not found", 404);

  const lat2 = shippingAddress.latitude as number;
  const lon2 = shippingAddress.longitude as number;
  // origin coordinates (BekuMart HQ)
  const originAddress = await prisma.addresses.findUnique({
    where: { id: ORIGIN_ADDRESS_ID as string },
  });

  if (!originAddress) throw new AppError("Origin address not found", 500);

  const lat1 = originAddress.latitude as number;
  const lon1 = originAddress.longitude as number;

  // Haversine formula to calculate distance between two coordinates
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  if (distance > 30) throw new AppError("Delivery address is too far", 400);

  // Calculate delivery fee based on distance
  const deliveryBaseFee = distance * 2500; // Example: 2500 IDR per km
  const markUpDeliveryFee = deliveryBaseFee + deliveryBaseFee * 0.1; // Add 10% markup
  const minDeliveryFee = 10000; // Minimum delivery fee
  const deliveryFee =
    markUpDeliveryFee < minDeliveryFee ? minDeliveryFee : markUpDeliveryFee;
  return Math.ceil(deliveryFee);
}

export async function GetShippingCostService(addressId: string) {
  // Fetch the address details
  const address = await prisma.addresses.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  const cart = await GetUserCartService(address.userId);

  if (!cart?.items.length) throw new AppError("Cart is empty", 404);

  if (cart.totalWeight > 30)
    throw new AppError("Order weight is too heavy", 400);
  // Calculate shipping cost based on address and cart weight
  let shippingCost;

  shippingCost = await calculateShippingCost(addressId);
  if (cart.totalWeight > 5) {
    shippingCost = shippingCost + shippingCost * 0.1; // Add additional fee for heavy items
  } else if (cart.totalWeight > 10) {
    shippingCost = shippingCost + shippingCost * 0.2; // Add additional fee for very heavy items
  } else if (cart.totalWeight > 20) {
    shippingCost = shippingCost + shippingCost * 0.3; // Add additional fee for extremely heavy items
  }

  return shippingCost;
}
