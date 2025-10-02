"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const provinceController_1 = require("../controllers/provinceController");
const router = (0, express_1.Router)();
// read
router.get("/", provinceController_1.GetAllProvincesController);
exports.default = router;
//# sourceMappingURL=provinceRoutes.js.map