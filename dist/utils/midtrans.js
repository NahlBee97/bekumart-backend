"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.snap = void 0;
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const config_1 = require("../config");
exports.snap = new midtrans_client_1.default.Snap({
    isProduction: false, // Set to true in production
    serverKey: config_1.MIDTRANS_SERVER_KEY,
    clientKey: config_1.MIDTRANS_CLIENT_KEY,
});
//# sourceMappingURL=midtrans.js.map