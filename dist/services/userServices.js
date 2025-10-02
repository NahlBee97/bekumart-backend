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
exports.UploadProfileService = UploadProfileService;
exports.GetUserInfoService = GetUserInfoService;
exports.EditUserInfoService = EditUserInfoService;
exports.ChangeUserPasswordService = ChangeUserPasswordService;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config");
const fileUploadHelper_1 = require("../helper/fileUploadHelper");
const prisma_1 = require("../lib/prisma");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const jsonwebtoken_1 = require("jsonwebtoken");
function UploadProfileService(userId, fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.prisma.users.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user)
                throw new Error("User not found");
            let publicId = `profile/profile_${userId}_${Date.now()}`; // Default for new images
            if (user.imageUrl) {
                const existingPublicId = (0, fileUploadHelper_1.getPublicIdFromUrl)(user.imageUrl);
                if (existingPublicId) {
                    publicId = existingPublicId; // Use existing public_id to overwrite
                }
            }
            // Upload the image to Cloudinary
            const uploadResult = yield cloudinary_1.default.uploader.upload(fileUri, {
                public_id: publicId,
                overwrite: true,
                folder: "profiles",
            });
            const imageUrl = uploadResult.secure_url;
            yield prisma_1.prisma.users.update({
                where: { id: userId },
                data: { imageUrl },
            });
        }
        catch (error) {
            throw error;
        }
    });
}
function GetUserInfoService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.prisma.users.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user)
                throw new Error("user not found");
            const payload = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
                imageUrl: user.imageUrl,
            };
            const token = (0, jsonwebtoken_1.sign)(payload, String(config_1.JWT_SECRET), { expiresIn: "1h" });
            return token;
        }
        catch (error) {
            throw error;
        }
    });
}
function EditUserInfoService(userId, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.prisma.users.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user)
                throw new Error("User not found");
            const updatedUser = yield prisma_1.prisma.users.update({
                where: { id: userId },
                data: {
                    name: userData.name || user.name,
                    email: userData.email || user.email,
                },
            });
            return updatedUser;
        }
        catch (error) {
            throw error;
        }
    });
}
function ChangeUserPasswordService(userId, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.prisma.users.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user)
                throw new Error("User not found");
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
            const updatedUser = yield prisma_1.prisma.users.update({
                where: { id: userId },
                data: {
                    password: hashedPassword
                },
            });
            return updatedUser;
        }
        catch (error) {
            throw error;
        }
    });
}
//# sourceMappingURL=userServices.js.map