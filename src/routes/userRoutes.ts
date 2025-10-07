import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares";
import { ChangeUserPasswordController, EditUserInfoController, GetUserInfoController, UploadProfileController } from "../controllers/userController";
import { upload } from "../middlewares/fileUpload.middleware";

const router = Router();

router.get("/:id", VerifyToken, GetUserInfoController);
router.put("/:id", VerifyToken, EditUserInfoController)
router.patch("/:id", VerifyToken, upload.single("file"), UploadProfileController);
router.patch("/password/:userId", VerifyToken, ChangeUserPasswordController);
router.patch("/reset-password/:userId", ChangeUserPasswordController);

export default router;
