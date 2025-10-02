"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Username must be at least 3 characters long"),
    email: zod_1.z.email("Please provide a valid email"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
    // Add any other fields from your IRegister interface
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.email("Please provide a valid email"),
    password: zod_1.z.string().min(1, "Password is required"),
});
//# sourceMappingURL=authSchemas.js.map