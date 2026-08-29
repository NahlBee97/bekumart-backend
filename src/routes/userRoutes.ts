import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares";
import {
  ChangeUserPasswordController,
  EditUserInfoController,
  GetUserInfoController,
  UploadProfileController,
} from "../controllers/userController";
import { upload } from "../middlewares/fileUpload.middleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  changePasswordSchema,
  updateUserSchema,
} from "../schemas/userSchemas";
import { z } from "zod";
import { idParamSchema, userIdParamSchema } from "../schemas/paramsSchemas";

const router = Router();

const userUpdateValidationSchema = z.object({
  body: updateUserSchema,
  params: z.object({
    id: z.string().min(1, "User ID wajib diisi"),
  }),
});

const changePasswordValidationSchema = z.object({
  body: changePasswordSchema,
  params: z.object({
    userId: z.string().min(1, "User ID wajib diisi"),
  }),
});

router.get(
  "/:id",
  VerifyToken,
  validateRequest(idParamSchema),
  GetUserInfoController
);
router.put(
  "/:id",
  VerifyToken,
  validateRequest(updateUserSchema),
  EditUserInfoController
);
router.patch(
  "/:id",
  VerifyToken,
  upload.single("file"),
  validateRequest(idParamSchema),
  UploadProfileController
);
router.patch(
  "/password/:userId",
  VerifyToken,
  validateRequest(userIdParamSchema),
  validateRequest(changePasswordSchema),
  ChangeUserPasswordController
);
// NOTE: the insecure, unauthenticated "/reset-password/:userId" endpoint
// that used to live here has been removed - it allowed anyone to change
// any user's password just by knowing their userId. The correct,
// token-verified reset flow is /api/auth/verify-reset + /api/auth/set-password.

export default router;
