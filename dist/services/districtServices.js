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
exports.fetchDistrictsByCity = fetchDistrictsByCity;
exports.getDistrictId = getDistrictId;
exports.GetDistrictsByCityService = GetDistrictsByCityService;
const axios_1 = __importDefault(require("axios"));
const cityServices_1 = require("./cityServices");
const redis_1 = require("../lib/redis");
const config_1 = require("../config");
function fetchDistrictsByCity(province, city) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cityId = yield (0, cityServices_1.getCityId)(province, city);
            const cachedValue = yield redis_1.redis.get(`${city.toLowerCase()}_districts`);
            if (cachedValue) {
                return JSON.parse(cachedValue);
            }
            const response = yield axios_1.default.get(`${config_1.RAJAONGKIR_BASE_URL}/destination/district/${cityId}`, {
                headers: { accept: "application/json", key: config_1.RAJAONGKIR_API_KEY },
            });
            const districts = response.data.data;
            redis_1.redis.set(`${city.toLowerCase()}_districts`, JSON.stringify(districts));
            return districts;
        }
        catch (err) {
            throw err;
        }
    });
}
function getDistrictId(province, city, district) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const districts = yield fetchDistrictsByCity(province, city);
            const matchingDistrict = districts.find((d) => d.name.toLowerCase() === district.toLowerCase());
            return matchingDistrict ? matchingDistrict.id : null;
        }
        catch (err) {
            throw err;
        }
    });
}
function GetDistrictsByCityService(province, city) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const districts = yield fetchDistrictsByCity(province, city);
            return districts;
        }
        catch (err) {
            throw err;
        }
    });
}
//# sourceMappingURL=districtServices.js.map