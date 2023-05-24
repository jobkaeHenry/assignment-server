import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export const createAccToken = (userId: string, expiresIn = "1h") => {
  return jwt.sign({ userId }, JWT_SECRET_KEY as Secret, { expiresIn });
};

export const createRefreshToken = (userId: string, expiresIn = "7d") => {
  const refreshToken = jwt.sign({ userId }, JWT_SECRET_KEY as Secret, {
    expiresIn,
  });
  return refreshToken;
};
