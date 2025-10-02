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
exports.GetSubDistrictsByDistrictController = GetSubDistrictsByDistrictController;
const subDistrictService_1 = require("../services/subDistrictService");
function GetSubDistrictsByDistrictController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const city = req.query.city;
            const province = req.query.province;
            const district = req.query.district;
            const districts = yield (0, subDistrictService_1.GetSubDistrictsByDistrictService)(province, city, district);
            res.status(200).send({
                message: `Get sub-districts by district success`,
                data: districts,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
//# sourceMappingURL=subDistrictControllers.js.map