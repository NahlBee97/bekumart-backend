import { Router } from "express";
import {
  CheckController,
  GoogleLoginController,
  LoginController,
  LogOutController,
  RefreshTokenController,
  RegisterController,
  SetPasswordController,
  VerifyResetPasswordController,
} from "../controllers/authControllers";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  GoogleLoginSchema,
  VerifyResetPasswordSchema,
} from "../schemas/authSchemas";

const router = Router();

router.get("/check", CheckController);
router.get("/refresh-token", RefreshTokenController);
router.post("/register", validateRequest(RegisterSchema), RegisterController);
router.post("/google-login", validateRequest(GoogleLoginSchema), GoogleLoginController);
router.post("/login", validateRequest(LoginSchema), LoginController);
router.post("/logout", LogOutController);
router.post(
  "/verify-reset",
  validateRequest(VerifyResetPasswordSchema),
  VerifyResetPasswordController
);
router.patch(
  "/set-password",
  validateRequest(ChangePasswordSchema),
  SetPasswordController
);

export default router;
