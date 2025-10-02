"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const config_1 = require("../config");
cloudinary_1.v2.config({
    cloud_name: config_1.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: config_1.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY,
    api_secret: config_1.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET,
});
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map