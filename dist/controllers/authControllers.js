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
exports.RegisterController = RegisterController;
exports.LoginController = LoginController;
const authSchemas_1 = require("../schemas/authSchemas");
const authServices_1 = require("../services/authServices");
function RegisterController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userData = authSchemas_1.RegisterSchema.parse(req.body);
            const newUser = yield (0, authServices_1.RegisterService)(userData);
            res
                .status(200)
                .send({ message: `New user register success`, data: newUser });
        }
        catch (err) {
            next(err);
        }
    });
}
function LoginController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userData = authSchemas_1.LoginSchema.parse(req.body);
            const user = yield (0, authServices_1.LoginService)(userData);
            res.status(200).send({ message: `Login success`, data: user });
        }
        catch (err) {
            next(err);
        }
    });
}
//# sourceMappingURL=authControllers.js.map