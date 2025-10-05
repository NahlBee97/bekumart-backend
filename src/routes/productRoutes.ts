import { Router } from "express";
import { RoleGuard, VerifyToken } from "../middlewares/authMiddlewares";
import { CreateProductController, DeleteProductController, GetProductsByIdController, GetProductsController, UpdateProductController } from "../controllers/productControllers";

const router = Router();

router.get("/", GetProductsController);
router.get("/:id", GetProductsByIdController);
router.post("/", VerifyToken, RoleGuard, CreateProductController);
router.put("/:id", VerifyToken, RoleGuard, UpdateProductController);
router.delete("/:id", VerifyToken, RoleGuard, DeleteProductController);

export default router;
