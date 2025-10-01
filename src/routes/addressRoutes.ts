import { Router } from "express";
import { CreateAddressController, DeleteAddressByIdController, EditAddressByIdController, GetAddressesByUserIdController, SetDefaultAddressController } from "../controllers/addressControllers";
import { VerifyToken } from "../middlewares/authMiddlewares";

const router = Router();

router.get("/:userId", VerifyToken, GetAddressesByUserIdController);
router.post("/", VerifyToken, CreateAddressController);
router.put("/:id", VerifyToken, EditAddressByIdController);
router.patch("/:id", VerifyToken, SetDefaultAddressController);
router.delete("/:id", VerifyToken, DeleteAddressByIdController);

export default router;
