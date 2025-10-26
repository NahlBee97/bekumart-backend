import { Router } from "express";
import {
  AddItemToCartController,
  DeleteItemInCartController,
  GetUserCartController,
  UpdateItemInCartController,
} from "../controllers/cartControllers";
import { VerifyToken } from "../middlewares/authMiddlewares";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  AddItemToCartSchema,
  UpdateCartItemSchema,
} from "../schemas/cartSchemas";
import { itemIdParamSchema, userIdParamSchema } from "../schemas/paramsSchemas";

const router = Router();

router.get(
  "/:userId",
  VerifyToken,
  validateRequest(userIdParamSchema),
  GetUserCartController
);
router.post(
  "/items",
  VerifyToken,
  validateRequest(AddItemToCartSchema),
  AddItemToCartController
);
router.put(
  "/items/:itemId",
  VerifyToken,
  validateRequest(itemIdParamSchema),
  validateRequest(UpdateCartItemSchema),
  UpdateItemInCartController
);
router.delete(
  "/items/:itemId",
  VerifyToken,
  validateRequest(itemIdParamSchema),
  DeleteItemInCartController
);

export default router;
