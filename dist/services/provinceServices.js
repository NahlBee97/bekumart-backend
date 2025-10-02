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
exports.fetchProvince = fetchProvince;
exports.getProvinceId = getProvinceId;
exports.GetAllProvincesService = GetAllProvincesService;
const axios_1 = __importDefault(require("axios"));
const redis_1 = require("../lib/redis");
const config_1 = require("../config");
function fetchProvince() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cachedValue = yield redis_1.redis.get("provinces");
            if (cachedValue) {
                return JSON.parse(cachedValue);
            }
            const response = yield axios_1.default.get(`${config_1.RAJAONGKIR_BASE_URL}/destination/province`, {
                headers: { accept: "application/json", key: config_1.RAJAONGKIR_API_KEY },
            });
            const provinces = response.data.data;
            redis_1.redis.set("provinces", JSON.stringify(provinces));
            return provinces;
        }
        catch (err) {
            throw err;
        }
    });
}
function getProvinceId(province) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provinces = yield fetchProvince();
            const matchingProvince = provinces.find((p) => p.name.toLowerCase() === province.toLowerCase());
            return matchingProvince ? matchingProvince.id : null;
        }
        catch (err) {
            throw err;
        }
    });
}
function GetAllProvincesService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provinces = yield fetchProvince();
            return provinces;
        }
        catch (err) {
            throw err;
        }
    });
}
//# sourceMappingURL=provinceServices.js.map