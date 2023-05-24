import { User } from "../models/user";
import { UserData } from "./user";

declare global {
  namespace Express {
    interface Request {
      userData: UserData;
    }
  }
}
