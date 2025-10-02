"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subDistrictControllers_1 = require("../controllers/subDistrictControllers");
const router = (0, express_1.Router)();
// read
router.get("/", subDistrictControllers_1.GetSubDistrictsByDistrictController);
exports.default = router;
//# sourceMappingURL=subDistrictRoutes.js.map