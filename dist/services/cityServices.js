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
exports.fetchCitiesByProvince = fetchCitiesByProvince;
exports.getCityId = getCityId;
exports.GetCitiesByProvinceService = GetCitiesByProvinceService;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const provinceServices_1 = require("./provinceServices");
const redis_1 = require("../lib/redis");
function fetchCitiesByProvince(province) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provinceId = yield (0, provinceServices_1.getProvinceId)(province);
            const cachedValue = yield redis_1.redis.get(`${province.toLowerCase()}_cities`);
            if (cachedValue) {
                return JSON.parse(cachedValue);
            }
            const response = yield axios_1.default.get(`${config_1.RAJAONGKIR_BASE_URL}/destination/city/${provinceId}`, {
                headers: { accept: "application/json", key: config_1.RAJAONGKIR_API_KEY },
            });
            const cities = response.data.data;
            redis_1.redis.set(`${province.toLowerCase()}_cities`, JSON.stringify(cities));
            return cities;
        }
        catch (err) {
            throw err;
        }
    });
}
function getCityId(province, city) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cities = yield fetchCitiesByProvince(province);
            const matchingCity = cities.find((c) => c.name.toLowerCase() === city.toLowerCase());
            return matchingCity ? matchingCity.id : null;
        }
        catch (err) {
            throw err;
        }
    });
}
function GetCitiesByProvinceService(province) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cities = yield fetchCitiesByProvince(province);
            return cities;
        }
        catch (err) {
            throw err;
        }
    });
}
//# sourceMappingURL=cityServices.js.map