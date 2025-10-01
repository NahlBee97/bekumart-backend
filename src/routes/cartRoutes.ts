import { Router } from "express";
import { AddItemToCartController, DeleteItemInCartController, GetUserCartController, UpdateItemInCartController } from "../controllers/cartControllers";
import { VerifyToken } from "../middlewares/authMiddlewares";

const router = Router();

router.get("/:userId", VerifyToken, GetUserCartController);
router.post("/items", VerifyToken, AddItemToCartController);
router.put("/items/:itemId", VerifyToken, UpdateItemInCartController);
router.delete("/items/:itemId", VerifyToken, DeleteItemInCartController);

export default router;
