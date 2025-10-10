import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { FE_URL, PORT } from "./config";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Routes
import AuthRouter from "./routes/authRoutes";
import UserRouter from "./routes/userRoutes";
import ProductRouter from "./routes/productRoutes";
import ProductPhotoRouter from "./routes/productPhotosRoutes";
import CategoryRouter from "./routes/categoryRoutes";
import CartRouter from "./routes/cartRoutes";
import OrderRouter from "./routes/orderRoutes";
import CityRouter from "./routes/cityRoutes";
import ProvinceRouter from "./routes/provinceRoutes";
import DistrictRouter from "./routes/districtRoutes";
import SubDistrictRouter from "./routes/subDistrictRoutes";
import AddressesRouter from "./routes/addressRoutes";
import ShippingCostRouter from "./routes/shippingCostRoutes";

// cors
app.use(
  cors({
    origin: FE_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use(cookieParser());

// --- Routes ---
app.get('/', (req: Request, res: Response) => {
  res.send("Connected");
});

app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);
app.use("/api/products", ProductRouter);
app.use("/api/product-photos", ProductPhotoRouter);
app.use("/api/categories", CategoryRouter);
app.use("/api/carts", CartRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/cities", CityRouter);
app.use("/api/provinces", ProvinceRouter);
app.use("/api/districts", DistrictRouter);
app.use("/api/sub-districts", SubDistrictRouter);
app.use("/api/addresses", AddressesRouter);
app.use("/api/shipping-cost", ShippingCostRouter);

// --- Central Error Handler ---
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("UNHANDLED ERROR:", error); // Log the error for debugging

  res.status(500).json({ message: "Internal Server Error" });
});

// app.listen(PORT, () => {
//   console.log(`Backend server is running on http://localhost:${PORT}`);
// });

export default app;