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
exports.GetDistrictsByCityController = GetDistrictsByCityController;
const districtServices_1 = require("../services/districtServices");
function GetDistrictsByCityController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const city = req.query.city;
            const province = req.query.province;
            const districts = yield (0, districtServices_1.GetDistrictsByCityService)(province, city);
            res.status(200).send({
                message: `Get districts by city success`,
                data: districts,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
//# sourceMappingURL=districtController.js.map