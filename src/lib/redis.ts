import {Redis} from "ioredis";
import { REDIS_URL } from "../config";

const getRedisUrl = () => {
    if (REDIS_URL) {
        return REDIS_URL;
    }

    throw new Error("REDIS_URL is not defined");
};

export const redis = new Redis(getRedisUrl());