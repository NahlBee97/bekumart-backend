import { Router } from "express";
import { LoginController, RegisterController } from "../controllers/authControllers.ts";

const router = Router();

router.post("/register", RegisterController);
router.post("/login", LoginController);

export default router;
