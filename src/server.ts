import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandlers";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
import AuthRouter from "./routes/authRoutes";
import UserRouter from "./routes/userRoutes"
import ProductRouter from "./routes/productRoutes";
import CategoryRouter from "./routes/categoryRoutes";
import CartRouter from "./routes/cartRoutes";
import OrderRouter from "./routes/orderRoutes";
import CityRouter from "./routes/city.routes";
import ProvinceRouter from "./routes/province.routes";
import DistrictRouter from "./routes/district.routes";
import SubDistrictRouter from "./routes/subDistrictRoutes";
import AddressesRouter from "./routes/addressRoutes";
import ShippingCostRouter from "./routes/shippingCostRoutes";

// Error Handler

// cors
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://unpneumatic-postmuscular-deeann.ngrok-free.dev",
    ],
    credentials: true,
  })
);
app.use(express.json()); // Allows server to accept JSON data

//api routes
app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);
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

// --- Central Error Handler ---
// app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
