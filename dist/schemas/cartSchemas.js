"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddItemToCartSchema = void 0;
const zod_1 = require("zod");
exports.AddItemToCartSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "User ID is required"),
    productId: zod_1.z.string().min(1, "Product ID is required"),
});
//# sourceMappingURL=cartSchemas.js.map