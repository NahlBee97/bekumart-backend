"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cityController_1 = require("../controllers/cityController");
const router = (0, express_1.Router)();
// read
router.get("/:province", cityController_1.GetCitiesByProvinceController);
exports.default = router;
//# sourceMappingURL=cityRoutes.js.map