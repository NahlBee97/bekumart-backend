import { Router } from "express";
import { LoginController, RegisterController, SetPasswordController, VerifyResetController } from "../controllers/authControllers";

const router = Router();

router.post("/register", RegisterController);
router.post("/login", LoginController);
router.post("/verify-reset", VerifyResetController);
router.patch("/set-password", SetPasswordController);

export default router;
