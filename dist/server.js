"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const dotenv_1 = __importDefault(require("dotenv"));
// import { errorHandler } from "./middlewares/errorHandlers";
dotenv_1.default.config();
const app = (0, express_1.default)();
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const cityRoutes_1 = __importDefault(require("./routes/cityRoutes"));
const provinceRoutes_1 = __importDefault(require("./routes/provinceRoutes"));
const districtRoutes_1 = __importDefault(require("./routes/districtRoutes"));
const subDistrictRoutes_1 = __importDefault(require("./routes/subDistrictRoutes"));
const addressRoutes_1 = __importDefault(require("./routes/addressRoutes"));
const shippingCostRoutes_1 = __importDefault(require("./routes/shippingCostRoutes"));
// Error Handler
// cors
app.use((0, cors_1.default)({
    origin: config_1.FE_URL,
    credentials: true,
}));
app.use(express_1.default.json()); // Allows server to accept JSON data
//api routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/carts", cartRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/cities", cityRoutes_1.default);
app.use("/api/provinces", provinceRoutes_1.default);
app.use("/api/districts", districtRoutes_1.default);
app.use("/api/sub-districts", subDistrictRoutes_1.default);
app.use("/api/addresses", addressRoutes_1.default);
app.use("/api/shipping-cost", shippingCostRoutes_1.default);
// --- Central Error Handler ---
// app.use(errorHandler);
app.listen(config_1.PORT, () => {
    console.log(`Backend server is running on http://localhost:${config_1.PORT}`);
});
//# sourceMappingURL=server.js.map