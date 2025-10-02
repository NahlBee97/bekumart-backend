"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductSchema = exports.CreateProductSchema = void 0;
const zod_1 = require("zod");
exports.CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Product name is required"),
    description: zod_1.z.string().min(1, "Product description is required"),
    price: zod_1.z.number().min(0, "Price must be a positive number"),
    stock: zod_1.z.number().min(0, "Stock must be a positive number"),
    weightInKg: zod_1.z.number().min(0, "Weight must be a positive number"),
    categoryId: zod_1.z.string().min(1, "Category ID is required"),
});
exports.UpdateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().min(1).optional(),
    price: zod_1.z.number().min(0).optional(),
    stock: zod_1.z.number().min(0).optional(),
    weightInKg: zod_1.z.number().min(0).optional(),
    categoryId: zod_1.z.string().min(1).optional(),
});
//# sourceMappingURL=productSchemas.js.map