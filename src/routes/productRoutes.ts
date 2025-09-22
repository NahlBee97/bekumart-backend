import { Router } from "express";
import { CreateProductController, DeleteProductController, GetProductsController, UpdateProductController, UpdateProductPhotoController } from "../controllers/productControllers.ts";
import { RoleGuard, VerifyToken } from "../middlewares/authMiddlewares.ts";
import { upload } from "../middlewares/fileUpload.middleware.ts";

const router = Router();

router.get("/", GetProductsController);
router.post("/", VerifyToken, RoleGuard, CreateProductController);
router.put("/:id", VerifyToken, RoleGuard, UpdateProductController);
router.patch("/:id", VerifyToken, RoleGuard,upload.single("file"), UpdateProductPhotoController);
router.delete("/:id", VerifyToken, RoleGuard, DeleteProductController);

export default router;
