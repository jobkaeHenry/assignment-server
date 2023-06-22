import express from "express";
import {
  addCartItems,
  changeQuantityById,
  deleteCartItemsById,
  getCartItemsByUserId,
} from "../controllers/cartItems-controller";
import authChecker from "../middleware/authChecker";

const router = express.Router();

router.use(authChecker);
router.get("/", getCartItemsByUserId);
router.post("/", addCartItems);
router.put('/:id/quantity',changeQuantityById)
router.delete("/:id", deleteCartItemsById);
export default router;
