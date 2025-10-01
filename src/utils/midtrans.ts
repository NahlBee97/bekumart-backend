import Midtrans from "midtrans-client";
import { MIDTRANS_CLIENT_KEY, MIDTRANS_SERVER_KEY } from "../config";

export const snap = new Midtrans.Snap({
  isProduction: false, // Set to true in production
  serverKey: MIDTRANS_SERVER_KEY as string,
  clientKey: MIDTRANS_CLIENT_KEY as string,
});