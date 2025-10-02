"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartControllers_1 = require("../controllers/cartControllers");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const router = (0, express_1.Router)();
router.get("/:userId", authMiddlewares_1.VerifyToken, cartControllers_1.GetUserCartController);
router.post("/items", authMiddlewares_1.VerifyToken, cartControllers_1.AddItemToCartController);
router.put("/items/:itemId", authMiddlewares_1.VerifyToken, cartControllers_1.UpdateItemInCartController);
router.delete("/items/:itemId", authMiddlewares_1.VerifyToken, cartControllers_1.DeleteItemInCartController);
exports.default = router;
//# sourceMappingURL=cartRoutes.js.map