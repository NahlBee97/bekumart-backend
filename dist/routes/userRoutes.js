"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const userController_1 = require("../controllers/userController");
const fileUpload_middleware_1 = require("../middlewares/fileUpload.middleware");
const router = (0, express_1.Router)();
router.get("/:id", authMiddlewares_1.VerifyToken, userController_1.GetUserInfoController);
router.put("/:id", authMiddlewares_1.VerifyToken, userController_1.EditUserInfoController);
router.patch("/:id", authMiddlewares_1.VerifyToken, fileUpload_middleware_1.upload.single("file"), userController_1.UploadProfileController);
router.patch("/password/:userId", authMiddlewares_1.VerifyToken, userController_1.ChangeUserPasswordController);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map