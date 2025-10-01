import { Router } from "express";
import { CreateProductController, DeleteProductController, GetProductsByIdController, GetProductsController, UpdateProductController, UpdateProductPhotoController } from "../controllers/productControllers";
import { RoleGuard, VerifyToken } from "../middlewares/authMiddlewares";
import { upload } from "../middlewares/fileUpload.middleware";

const router = Router();

router.get("/", GetProductsController);
router.get("/:id", GetProductsByIdController);
router.post("/", VerifyToken, RoleGuard, CreateProductController);
router.put("/:id", VerifyToken, RoleGuard, UpdateProductController);
router.patch("/:id", VerifyToken, RoleGuard,upload.single("file"), UpdateProductPhotoController);
router.delete("/:id", VerifyToken, RoleGuard, DeleteProductController);

export default router;
