import { Router } from "express";
import { RoleGuard, VerifyToken } from "../middlewares/authMiddlewares";
import {
  CreateProductController,
  DeleteProductController,
  GetProductsByIdController,
  GetProductsController,
  UpdateProductController,
} from "../controllers/productControllers";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "../schemas/productSchemas";
import { z } from "zod";
import { productQuerySchema } from "../schemas/querySchemas";
import { idParamSchema } from "../schemas/paramsSchemas";

const router = Router();

const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID produk wajib diisi"),
  }),
});

router.get("/", validateRequest(productQuerySchema), GetProductsController);
router.get("/:id", validateRequest(idParamSchema), GetProductsByIdController);
router.post(
  "/",
  VerifyToken,
  RoleGuard,
  validateRequest(CreateProductSchema),
  CreateProductController
);
router.put(
  "/:id",
  VerifyToken,
  RoleGuard,
  validateRequest(idParamSchema),
  validateRequest(UpdateProductSchema),
  UpdateProductController
);
router.delete(
  "/:id",
  VerifyToken,
  RoleGuard,
  validateRequest(idParamSchema),
  DeleteProductController
);

export default router;
