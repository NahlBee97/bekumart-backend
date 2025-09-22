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

// --- Central Error Handler ---
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
