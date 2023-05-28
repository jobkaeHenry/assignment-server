import express from "express";
import {
  addCartItems,
  deleteCartItemsById,
  getCartItemsByUserId,
} from "../controllers/cartItems-controller";
import authChecker from "../middleware/authChecker";

const router = express.Router();

router.use(authChecker);
router.get("/", getCartItemsByUserId);
router.post("/", addCartItems);
router.delete("/:id", deleteCartItemsById);
export default router;
