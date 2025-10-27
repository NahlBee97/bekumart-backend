import { Router } from "express";
import {
  CreateAddressController,
  DeleteAddressByIdController,
  EditAddressByIdController,
  GetAddressesByUserIdController,
  SetDefaultAddressController,
} from "../controllers/addressControllers";
import { VerifyToken } from "../middlewares/authMiddlewares";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  createAddressSchema,
  editAddressSchema,
} from "../schemas/addressSchemas";
import { idParamSchema, userIdParamSchema } from "../schemas/paramsSchemas";

const router = Router();

router.get("/:userId", validateRequest(userIdParamSchema), VerifyToken, GetAddressesByUserIdController);
router.post(
  "/",
  VerifyToken,
  validateRequest(createAddressSchema),
  CreateAddressController
);
router.put(
  "/:id",
  VerifyToken,
  validateRequest(idParamSchema),
  validateRequest(editAddressSchema),
  EditAddressByIdController
);
router.patch(
  "/:id",
  VerifyToken,
  validateRequest(idParamSchema),
  SetDefaultAddressController
);
router.delete(
  "/:id",
  VerifyToken,
  validateRequest(idParamSchema),
  DeleteAddressByIdController
);

export default router;
