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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyToken = VerifyToken;
exports.RoleGuard = RoleGuard;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config");
// Custom error class to handle HTTP status codes
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
function VerifyToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
            if (!token) {
                throw new AppError("Unauthorized: No token provided", 401);
            }
            const decodedPayload = (0, jsonwebtoken_1.verify)(token, String(config_1.JWT_SECRET));
            if (!decodedPayload.id || !decodedPayload.role) {
                throw new AppError("Invalid token: Payload missing required fields", 401);
            }
            req.user = decodedPayload;
            next();
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.TokenExpiredError) {
                return next(new AppError("Unauthorized: Token has expired", 401));
            }
            if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
                return next(new AppError("Unauthorized: Invalid token", 401));
            }
            next(err);
        }
    });
}
function RoleGuard(req, res, next) {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "ADMIN") {
        return next(new AppError("Forbidden: You do not have permission to perform this action", 403));
    }
    next();
}
//# sourceMappingURL=authMiddlewares.js.map