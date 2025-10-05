import express, { Request, Response } from "express";
import cors from "cors";
import { FE_URL, PORT } from "./config";
import dotenv from "dotenv";
// import { errorHandler } from "./middlewares/errorHandlers";

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

// Error Handler

// cors
app.use(
  cors({
    origin: FE_URL,
    credentials: true,
  })
);
app.use(express.json()); // Allows server to accept JSON data

//api routes
// --- Routes ---
app.get('/', (req: Request, res: Response) => {
  res.send("hello world");
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
// app.use(errorHandler);

// app.listen(PORT, () => {
//   console.log(`Backend server is running on http://localhost:${PORT}`);
// });

export default app;