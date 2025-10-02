"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
const config_1 = require("../config");
const getRedisUrl = () => {
    if (config_1.REDIS_URL) {
        return config_1.REDIS_URL;
    }
    throw new Error("REDIS_URL is not defined");
};
exports.redis = new ioredis_1.Redis(getRedisUrl());
//# sourceMappingURL=redis.js.map