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
exports.UploadProfileController = UploadProfileController;
exports.GetUserInfoController = GetUserInfoController;
exports.EditUserInfoController = EditUserInfoController;
exports.ChangeUserPasswordController = ChangeUserPasswordController;
const fileUploadHelper_1 = require("../helper/fileUploadHelper");
const userServices_1 = require("../services/userServices");
function UploadProfileController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            const { file } = req;
            if (!file)
                throw new Error("File not found");
            // 2. Convert the file buffer to a Data URI
            const fileUri = (0, fileUploadHelper_1.bufferToDataURI)(file.buffer, file.mimetype);
            yield (0, userServices_1.UploadProfileService)(userId, fileUri);
            res.status(200).send({
                message: "Upload profile successfully",
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function GetUserInfoController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            const token = yield (0, userServices_1.GetUserInfoService)(userId);
            res.status(200).send({
                message: "Get user successfully",
                data: token,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function EditUserInfoController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            const userData = req.body;
            const updatedUser = yield (0, userServices_1.EditUserInfoService)(userId, userData);
            res.status(200).send({
                message: "Edit user successfully",
                data: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function ChangeUserPasswordController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const { newPassword } = req.body;
            const updatedUser = yield (0, userServices_1.ChangeUserPasswordService)(userId, newPassword);
            res.status(200).send({
                message: "Update user password successfully",
                data: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=userController.js.map