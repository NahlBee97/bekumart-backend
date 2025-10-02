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
exports.GetSubDistrictsByDistrictService = GetSubDistrictsByDistrictService;
const axios_1 = __importDefault(require("axios"));
const redis_1 = require("../lib/redis");
const config_1 = require("../config");
const districtServices_1 = require("./districtServices");
function GetSubDistrictsByDistrictService(province, city, district) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const districtId = yield (0, districtServices_1.getDistrictId)(province, city, district);
            const cachedValue = yield redis_1.redis.get(`${district.toLowerCase()}_sub_districts`);
            if (cachedValue) {
                return JSON.parse(cachedValue);
            }
            const response = yield axios_1.default.get(`${config_1.RAJAONGKIR_BASE_URL}/destination/sub-district/${districtId}`, {
                headers: { accept: "application/json", key: config_1.RAJAONGKIR_API_KEY },
            });
            const subDistricts = response.data.data;
            redis_1.redis.set(`${district.toLowerCase()}_sub_districts`, JSON.stringify(subDistricts));
            return subDistricts;
        }
        catch (err) {
            throw err;
        }
    });
}
//# sourceMappingURL=subDistrictService.js.map