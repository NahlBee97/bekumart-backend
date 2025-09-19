import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your frontend
    credentials: true,
  })
);
app.use(express.json()); // Allows server to accept JSON data

// Simple test route
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the BekuMart API! 🧊" });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
