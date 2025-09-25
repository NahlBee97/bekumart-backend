import { Router } from "express";
import { GetAddressesByUserIdController } from "../controllers/addressControllers.ts";
import { VerifyToken } from "../middlewares/authMiddlewares.ts";

const router = Router();

router.get("/:userId", VerifyToken, GetAddressesByUserIdController);

export default router;
