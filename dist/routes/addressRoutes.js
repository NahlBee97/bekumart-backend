"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const addressControllers_1 = require("../controllers/addressControllers");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const router = (0, express_1.Router)();
router.get("/:userId", authMiddlewares_1.VerifyToken, addressControllers_1.GetAddressesByUserIdController);
router.post("/", authMiddlewares_1.VerifyToken, addressControllers_1.CreateAddressController);
router.put("/:id", authMiddlewares_1.VerifyToken, addressControllers_1.EditAddressByIdController);
router.patch("/:id", authMiddlewares_1.VerifyToken, addressControllers_1.SetDefaultAddressController);
router.delete("/:id", authMiddlewares_1.VerifyToken, addressControllers_1.DeleteAddressByIdController);
exports.default = router;
//# sourceMappingURL=addressRoutes.js.map