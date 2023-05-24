import rateLimit from "express-rate-limit";
import { 분 } from "../const/time";

const apiLimiter = rateLimit({
  windowMs: 1 * 분,
  max: 100,
});
export default apiLimiter;
