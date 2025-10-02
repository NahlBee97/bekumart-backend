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
exports.GetAddressesByUserIdController = GetAddressesByUserIdController;
exports.EditAddressByIdController = EditAddressByIdController;
exports.SetDefaultAddressController = SetDefaultAddressController;
exports.DeleteAddressByIdController = DeleteAddressByIdController;
exports.CreateAddressController = CreateAddressController;
const addressServices_1 = require("../services/addressServices");
function GetAddressesByUserIdController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const addresses = yield (0, addressServices_1.GetAddressesByUserIdService)(userId);
            res
                .status(200)
                .send({ message: "Addresses retrieved successfully", data: addresses });
        }
        catch (error) {
            next(error);
        }
    });
}
function EditAddressByIdController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const addressId = req.params.id;
            const addressData = req.body;
            const updatedAddress = yield (0, addressServices_1.EditAddressByIdService)(addressId, addressData);
            res
                .status(200)
                .send({ message: "Edit Address successfully", data: updatedAddress });
        }
        catch (error) {
            next(error);
        }
    });
}
function SetDefaultAddressController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const addressId = req.params.id;
            const { isDefault } = req.body;
            const updatedAddress = yield (0, addressServices_1.SetDefaultAddressService)(addressId, isDefault);
            res
                .status(200)
                .send({
                message: "Set default address successfully",
                data: updatedAddress,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function DeleteAddressByIdController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const addressId = req.params.id;
            yield (0, addressServices_1.DeleteAddressByIdService)(addressId);
            res.status(200).send({ message: "Delete Address successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function CreateAddressController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bodyData = req.body;
            const { userId } = req.body;
            const address = yield (0, addressServices_1.CreateAddressService)(userId, bodyData);
            res.status(200).send({ message: "Create Address successfully", data: address });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=addressControllers.js.map