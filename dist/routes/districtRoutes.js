"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const districtController_1 = require("../controllers/districtController");
const router = (0, express_1.Router)();
// read
router.get("/", districtController_1.GetDistrictsByCityController);
exports.default = router;
//# sourceMappingURL=districtRoutes.js.map