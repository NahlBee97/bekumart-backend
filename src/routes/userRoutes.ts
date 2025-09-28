import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares.ts";
import { ChangeUserPasswordController, EditUserInfoController, GetUserInfoController, UploadProfileController } from "../controllers/userController.ts";
import { upload } from "../middlewares/fileUpload.middleware.ts";

const router = Router();

router.get("/:id", VerifyToken, GetUserInfoController);
router.put("/:id", VerifyToken, EditUserInfoController)
router.patch("/:id", VerifyToken, upload.single("file"), UploadProfileController);
router.patch("/password/:userId", VerifyToken, ChangeUserPasswordController);

export default router;
