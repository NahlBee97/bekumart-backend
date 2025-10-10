import { Router } from "express";
import { LoginController, RefreshTokenController, RegisterController, SetPasswordController, VerifyResetPasswordController } from "../controllers/authControllers";

const router = Router();

router.get("/refresh-token", RefreshTokenController);
router.post("/register", RegisterController);
router.post("/login", LoginController);
router.post("/verify-reset", VerifyResetPasswordController);
router.patch("/set-password", SetPasswordController);

export default router;
