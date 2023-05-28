import express from "express";
import {
  getUserInfoByToken,
  login,
  signUp,
  tokenRefresh,
  upgradeUser,
} from "../controllers/user-Controller";
import authChecker from "../middleware/authChecker";
import { getItemsByUserId } from "../controllers/items-controller";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/refresh", tokenRefresh);
router.get("/:id/sellingItems", getItemsByUserId);

// 보호된 라우팅 - authCheck
router.use(authChecker);
router.get("/userInfo", getUserInfoByToken);
router.post("/upgrade", upgradeUser);

export default router;
