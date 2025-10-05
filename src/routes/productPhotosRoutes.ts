import { Router } from "express";
import { RoleGuard, VerifyToken } from "../middlewares/authMiddlewares";
import { upload } from "../middlewares/fileUpload.middleware";
import { AddProductPhotoController, DeleteProductPhotoController, GetProductPhotosController, SetDefaultProductPhotoController, UpdateProductPhotoController } from "../controllers/productPhotosControllers";

const router = Router();

router.get("/:id", GetProductPhotosController);
router.put("/:id", VerifyToken, RoleGuard, SetDefaultProductPhotoController);
router.post("/:productId", VerifyToken, RoleGuard,upload.single("file"), AddProductPhotoController);
router.patch("/:id", VerifyToken, RoleGuard, upload.single("file"), UpdateProductPhotoController);
router.delete("/:id", VerifyToken, RoleGuard, DeleteProductPhotoController);

export default router;
