import { Router } from "express";
import { RoleGuard, VerifyToken } from "../middlewares/authMiddlewares";
import { SalesSummaryController } from "../controllers/dashboardController";
const router = Router();

router.get("/sales-summary", VerifyToken, RoleGuard, SalesSummaryController);

export default router;