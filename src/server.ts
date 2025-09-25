import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
import AuthRouter from "./routes/authRoutes.ts";
import ProductRouter from "./routes/productRoutes.ts";
import CategoryRouter from "./routes/categoryRoutes.ts";
import CartRouter from "./routes/cartRoutes.ts";
import OrderRouter from "./routes/orderRoutes.ts";
import CityRouter from "./routes/city.routes.ts";
import ProvinceRouter from "./routes/province.routes.ts";
import DistrictRouter from "./routes/district.routes.ts";
import SubDistrictRouter from "./routes/subDistrictRoutes.ts";
import AddressesRouter from "./routes/addressRoutes.ts";
import ShippingCostRouter from "./routes/shippingCostRoutes.ts";

// Error Handler
import { errorHandler } from "./middlewares/errorHandlers.ts";

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your frontend
    credentials: true,
  })
);
app.use(express.json()); // Allows server to accept JSON data

//api routes
app.use("/api/auth", AuthRouter);
app.use("/api/products", ProductRouter);
app.use("/api/categories", CategoryRouter);
app.use("/api/carts", CartRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/cities", CityRouter);
app.use("/api/provinces", ProvinceRouter);
app.use("/api/districts", DistrictRouter);
app.use("/api/sub-districts", SubDistrictRouter);
app.use("/api/addresses", AddressesRouter);
app.use("/api/shipping-cost", ShippingCostRouter);

// // --- Central Error Handler ---
// app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
