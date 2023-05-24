import express from "express";
import {
  createItem,deleteItemById, getItemsById, getItemsByUserId
} from "../controllers/items-controller";
import authChecker from "../middleware/authChecker";

const router = express.Router();
router.get("/:id",getItemsById)
router.use(authChecker);
router.get('/',getItemsByUserId)
router.post("/", createItem);
router.delete("/:id", deleteItemById);
export default router;
