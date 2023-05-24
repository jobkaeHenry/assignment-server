import { Request, Response, NextFunction } from "express";
import HttpError from "../models/error";
import { User } from "../models/user";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { createAccToken, createRefreshToken } from "../utils/tokenGenerator";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export const upgradeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const  userId  = req.userData?.userId;
  console.log(userId)
  let existingUser;
  try {
    existingUser = await User.findOne({ _id: userId });
  } catch (err) {
    const error = new HttpError("유저찾기 실패", 500);
    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError("존재하지 않는 유저입니다", 404);
    return next(error);
  }
  if(existingUser.isSeller){
    const error = new HttpError("이미 셀러입니다", 403);
    return next(error);
  }if(!existingUser.isSeller){
    existingUser.isSeller = true
    try {
      await existingUser.save();
      res.status(201)
    } catch (err) {
      const error = new HttpError("유저 정보 업데이트 실패", 500);
      return next(error);
    }
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, userName } = req.body;

  // 유저가 존재 하는지 여부
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "이미 존재하는 유저인지 확인에 실패했습니다.",
      500
    );
    return next(error);
  }
  // 존재한다면 에러 반환
  if (existingUser) {
    return next(new HttpError("이미 존재하는 유저입니다", 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("비밀번호 해싱에 실패했습니다", 500);
    next(error);
  }

  const createdUser = new User({
    email,
    password: hashedPassword,
    userName,
    cartItems: [],
    refreshToken: "",
  });

  const accessToken = createAccToken(createdUser.id);
  const refreshToken = createRefreshToken(createdUser.id);

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("유저 생성에 실패했습니다", 500);
    next(error);
  }

  res.status(201).json({
    userId: createdUser._id,
    userName: createdUser.userName,
    accessToken,
    refreshToken,
  });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 엠티체크 해야함
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("유저찾기 실패", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("존재하지 않는 유저입니다", 403);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(
      password,
      existingUser.password as string
    );
  } catch (err) {
    const error = new HttpError("비밀번호 비교에 실패했습니다", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("비밀번호가 일치하지않습니다", 403);
    return next(error);
  }

  const accessToken = createAccToken(existingUser.id);
  const refreshToken = createRefreshToken(existingUser.id);

  existingUser.refreshToken = refreshToken;
  try {
    existingUser.save();
  } catch (err) {
    return next(new HttpError("토큰 저장에 실패했습니다", 500));
  }

  res.status(200).json({
    userId: existingUser.id,
    userName: existingUser.userName,
    accessToken,
    refreshToken,
  });
};

export const tokenRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body;

  //@ts-expect-error
  jwt.verify(refreshToken, JWT_SECRET_KEY as Secret, async (err, decoded) => {
    if (err) {
      return next(new HttpError("유효하지 않은 토큰입니다", 401));
    }

    const { userId } = decoded;

    let existingUser;
    try {
      existingUser = await User.findOne({ _id: userId });
    } catch (err) {
      const error = new HttpError("내부적 오류", 500);
      return next(error);
    }

    if (!existingUser) {
      const error = new HttpError("해당 토큰ID의 유저가 존재하지않습니다", 404);
      return next(error);
    } else if (existingUser) {
      if (existingUser.refreshToken !== refreshToken) {
        const error = new HttpError("유효하지 않은 토큰입니다", 401);
        return next(error);
      }

      const newAccessToken = createAccToken(userId);
      const newRefreshToken = createRefreshToken(userId);
      existingUser.refreshToken = newRefreshToken;
      try {
        await existingUser.save();
      } catch (err) {
        const error = new HttpError("유저 생성에 실패했습니다", 500);
        next(error);
      }

      res
        .status(200)
        .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    }
  });
};
