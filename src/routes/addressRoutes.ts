import { Router } from "express";
import { DeleteAddressByIdController, EditAddressByIdController, GetAddressesByUserIdController, SetDefaultAddressController } from "../controllers/addressControllers.ts";
import { VerifyToken } from "../middlewares/authMiddlewares.ts";

const router = Router();

router.get("/:userId", VerifyToken, GetAddressesByUserIdController);
router.put("/:id", VerifyToken, EditAddressByIdController);
router.patch("/:id", VerifyToken, SetDefaultAddressController);
router.delete("/:id", VerifyToken, DeleteAddressByIdController);

export default router;
