import { Router } from "express";
import { RoleGuard, VerifyToken } from "../middlewares/authMiddlewares";
import { CustomerInsightsController, CustomerOriginSummaryController, OperationalSummaryController, ProductInsightsController, SalesSummaryController } from "../controllers/dashboardController";
const router = Router();

router.get("/sales-summary", VerifyToken, RoleGuard, SalesSummaryController);
router.get("/product-insights", VerifyToken, RoleGuard, ProductInsightsController);
router.get(
  "/customer-insights",
  VerifyToken,
  RoleGuard,
  CustomerInsightsController
);
router.get(
  "/operational-summary",
  VerifyToken,
  RoleGuard,
  OperationalSummaryController
);
router.get(
  "/origin-summary",
  VerifyToken,
  RoleGuard,
  CustomerOriginSummaryController
);

export default router;