"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productControllers_1 = require("../controllers/productControllers");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const fileUpload_middleware_1 = require("../middlewares/fileUpload.middleware");
const router = (0, express_1.Router)();
router.get("/", productControllers_1.GetProductsController);
router.get("/:id", productControllers_1.GetProductsByIdController);
router.post("/", authMiddlewares_1.VerifyToken, authMiddlewares_1.RoleGuard, productControllers_1.CreateProductController);
router.put("/:id", authMiddlewares_1.VerifyToken, authMiddlewares_1.RoleGuard, productControllers_1.UpdateProductController);
router.patch("/:id", authMiddlewares_1.VerifyToken, authMiddlewares_1.RoleGuard, fileUpload_middleware_1.upload.single("file"), productControllers_1.UpdateProductPhotoController);
router.delete("/:id", authMiddlewares_1.VerifyToken, authMiddlewares_1.RoleGuard, productControllers_1.DeleteProductController);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map