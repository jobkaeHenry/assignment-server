import { JwtPayload } from "jsonwebtoken";

export type UserData = { userId: string };

export interface TokenPayload extends JwtPayload {
  userId: string;
}
