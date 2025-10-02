"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterService = RegisterService;
exports.LoginService = LoginService;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const findUserByEmail_1 = require("../helper/findUserByEmail");
function RegisterService(userData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, email, password } = userData;
            const existingUser = yield (0, findUserByEmail_1.FindUserByEmail)(email);
            if (existingUser)
                throw new Error("Email already registered");
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            if (!hashedPassword)
                throw new Error("Failed hashing password");
            const newUser = yield prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const createdUser = yield tx.users.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        updatedAt: new Date(),
                    },
                });
                if (!createdUser)
                    throw new Error("Create new user failed");
                const cart = yield tx.carts.create({
                    data: { userId: createdUser.id },
                });
                if (!cart)
                    throw new Error("Failed to create cart");
                return createdUser;
            }));
            return newUser;
        }
        catch (err) {
            throw err;
        }
    });
}
function LoginService(userData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = userData;
            const user = yield (0, findUserByEmail_1.FindUserByEmail)(email);
            if (!user)
                throw new Error("User not found");
            const checkPass = yield bcryptjs_1.default.compare(password, user.password);
            if (!checkPass)
                throw new Error("Incorrect Password");
            const payload = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
                imageUrl: user.imageUrl,
            };
            const token = jsonwebtoken_1.default.sign(payload, String(config_1.JWT_SECRET), { expiresIn: "1h" });
            if (!token)
                throw new Error("Failed to generate token");
            return token;
        }
        catch (err) {
            throw err;
        }
    });
}
//# sourceMappingURL=authServices.js.map