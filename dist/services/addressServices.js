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
exports.GetAddressesByUserIdService = GetAddressesByUserIdService;
exports.EditAddressByIdService = EditAddressByIdService;
exports.SetDefaultAddressService = SetDefaultAddressService;
exports.DeleteAddressByIdService = DeleteAddressByIdService;
exports.CreateAddressService = CreateAddressService;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../lib/prisma");
function GetAddressesByUserIdService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const addresses = yield prisma_1.prisma.addresses.findMany({
                where: { userId },
            });
            return addresses;
        }
        catch (err) {
            throw err;
        }
    });
}
function EditAddressByIdService(addressId, addressData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const address = yield prisma_1.prisma.addresses.findUnique({
                where: {
                    id: addressId,
                },
            });
            if (!address)
                throw new Error("Address not found");
            const { subdistrict, district, city } = addressData;
            const addressDetailData = yield axios_1.default.get(`https://nominatim.openstreetmap.org/search?q=${subdistrict}%20${district}%20${city}&format=jsonv2&addressdetails=1&countrycodes=id`);
            if (addressDetailData.data.lenght === 0)
                throw new Error("Can not get the coordinates");
            const latitude = Number(addressDetailData.data[0].lat);
            const longitude = Number(addressDetailData.data[0].lon);
            const updatedAddress = yield prisma_1.prisma.addresses.update({
                where: { id: addressId },
                data: {
                    id: address.id,
                    street: addressData.street || address.street,
                    subdistrict: addressData.subdistrict || address.subdistrict,
                    district: addressData.district || address.district,
                    city: addressData.city || address.city,
                    province: addressData.province || address.province,
                    postalCode: addressData.postalCode || address.postalCode,
                    phone: addressData.phone || address.phone,
                    latitude: latitude || address.latitude,
                    longitude: longitude || address.longitude,
                },
            });
            return updatedAddress;
        }
        catch (error) {
            throw error;
        }
    });
}
function SetDefaultAddressService(addressId, isDefault) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const address = yield prisma_1.prisma.addresses.findUnique({
                where: {
                    id: addressId,
                },
            });
            if (!address)
                throw new Error("Address not found");
            yield prisma_1.prisma.addresses.updateMany({
                data: { isDefault: false },
            });
            const updatedAddress = yield prisma_1.prisma.addresses.update({
                where: { id: addressId },
                data: {
                    isDefault,
                },
            });
            return updatedAddress;
        }
        catch (error) {
            throw error;
        }
    });
}
function DeleteAddressByIdService(addressId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const address = yield prisma_1.prisma.addresses.findUnique({
                where: {
                    id: addressId,
                },
            });
            if (!address)
                throw new Error("Address not found");
            yield prisma_1.prisma.addresses.delete({
                where: { id: addressId },
            });
        }
        catch (error) {
            throw error;
        }
    });
}
function CreateAddressService(userId, bodyData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { subdistrict, district, city } = bodyData;
            const addressDetailData = yield axios_1.default.get(`https://nominatim.openstreetmap.org/search?q=${subdistrict}%20${district}%20${city}&format=jsonv2&addressdetails=1&countrycodes=id`);
            if (addressDetailData.data.lenght === 0)
                throw new Error("Can not get the coordinates");
            const latitude = Number(addressDetailData.data[0].lat);
            const longitude = Number(addressDetailData.data[0].lon);
            const address = yield prisma_1.prisma.addresses.create({
                data: Object.assign(Object.assign({}, bodyData), { userId,
                    latitude,
                    longitude }),
            });
            return address;
        }
        catch (error) {
            throw error;
        }
    });
}
//# sourceMappingURL=addressServices.js.map