import express from "express";
import {
  createItem,
  deleteItemById,
  getAllItems,
  getItemsById,
  getItemsByQuery,
} from "../controllers/items-controller";
import authChecker from "../middleware/authChecker";

const router = express.Router();
router.get("/all", getAllItems);
router.get("/:id", getItemsById);
router.get("/", getItemsByQuery);


router.use(authChecker);
router.post("/", createItem);
router.delete("/:id", deleteItemById);
export default router;
