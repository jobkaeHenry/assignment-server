import express from "express";
import { login, signUp,tokenRefresh, upgradeUser } from "../controllers/user-Controller";
import authChecker from "../middleware/authChecker";

const router = express.Router();

router.post("/signup", signUp);

router.post("/login", login);
router.post("/refresh", tokenRefresh);
// 보호된 라우팅 - authCheck
router.use(authChecker);
router.use('/upgrade',upgradeUser)

export default router;
