import { Router } from "express";
import { VerifyToken } from "../middlewares/authMiddlewares";
import { ContactController } from "../controllers/contactController";
import { validateRequest } from "../middlewares/validationMiddleware";
import { contactMessageSchema } from "../schemas/contactSchemas";

const router = Router();

router.post("/", validateRequest(contactMessageSchema), ContactController);

export default router;
