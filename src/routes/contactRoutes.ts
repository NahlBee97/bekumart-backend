import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares";
import { ContactController } from "../controllers/contactController";

const router = Router();

router.post("/", ContactController);

export default router;