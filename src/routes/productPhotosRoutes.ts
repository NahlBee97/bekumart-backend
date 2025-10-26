import { Router } from "express";
import { RoleGuard, VerifyToken } from "../middlewares/authMiddlewares";
import { upload } from "../middlewares/fileUpload.middleware";
import {
  AddProductPhotoController,
  DeleteProductPhotoController,
  GetProductPhotosController,
  SetDefaultProductPhotoController,
  UpdateProductPhotoController,
} from "../controllers/productPhotosControllers";
import { validateRequest } from "../middlewares/validationMiddleware";
import { idParamSchema, productIdParamSchema } from "../schemas/paramsSchemas";

const router = Router();

router.get("/:id", validateRequest(idParamSchema), GetProductPhotosController);
router.put(
  "/:id",
  VerifyToken,
  RoleGuard,
  validateRequest(idParamSchema),
  SetDefaultProductPhotoController
);
router.post(
  "/:productId",
  VerifyToken,
  RoleGuard,
  upload.single("file"),
  validateRequest(productIdParamSchema),
  AddProductPhotoController
);
router.patch(
  "/:id",
  VerifyToken,
  RoleGuard,
  upload.single("file"),
  validateRequest(idParamSchema),
  UpdateProductPhotoController
);
router.delete(
  "/:id",
  VerifyToken,
  RoleGuard,
  validateRequest(idParamSchema),
  DeleteProductPhotoController
);

export default router;
