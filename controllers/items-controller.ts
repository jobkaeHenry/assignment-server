import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import HttpError from "../models/error";
import { Items } from "../models/Items";
import { User } from "../models/user";
export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description, price } = req.body;
  const userId = req.userData?.userId;

  //express-validator 추가하기
  const createdItem = new Items({
    seller: userId,
    title,
    description,
    price,
    //@ts-expect-error 체크함
    image: req.file.location,
  });


  // 유저가 실존하는지 검증
  let ActualUser;
  try {
    ActualUser = await User.findById(userId);
  } catch (err) {
    return next(
      new HttpError("유저를 검증하는 과정에서 오류가 발생했습니다", 500)
    );
  }
  // 실존하지 않을경우
  if (!ActualUser) {
    return next(new HttpError("존재하지 않는 유저입니다", 403));
  }
  if (!ActualUser.isSeller) {
    return next(new HttpError("셀러가 아닙니다", 403));
  }
  // 실존할 경우
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdItem.save({ session });
    // @ts-expect-error
    ActualUser.items.push(createdItem);
    await ActualUser.save({ session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError("저장에 실패했습니다", 500);
    return next(error);
  }
  res.status(201).json({ id: createdItem.toObject({ getters: true })._id });
  // }
};

export const deleteItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const CartItemsId = req.params.id;
  const userId = req.userData.userId;

  // 삭제할 애를 정함
  let targetCartItems;
  try {
    targetCartItems = await Items.findById(CartItemsId).populate("seller");
  } catch (error) {
    return next(new HttpError("삭제 대상 게시물 조회에 실패했습니다", 500));
  }
  // 아이템 존재여부 확인
  if (!targetCartItems) {
    return next(new HttpError("존재하지 않는 아이템입니다", 404));
  }
  // 권한확인
  let user;
  try {
    user = User.findById(userId);
  } catch {
    return next(new HttpError("존재하지 않는 유저입니다", 403));
  }
  // @ts-expect-error
  console.log(targetCartItems.seller.id, userId);
  // @ts-expect-error
  if (targetCartItems.seller.id !== userId) {
    return next(new HttpError("삭제 권한이 없습니다", 403));
  } else
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      await targetCartItems.remove({ session });
      // @ts-expect-error
      targetCartItems.seller.items.pull(targetCartItems);
      // @ts-expect-error
      await targetCartItems.seller.save({ session });
      session.commitTransaction();
    } catch (error) {
      return next(new HttpError("삭제에 실패했습니다", 500));
    }
  res.status(201).json({ message: "삭제가 완료되었습니다" });
};

export const getItemsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ItemId = req.params.id;
  let item;
  try {
    item = await Items.findById(ItemId).populate("seller");
  } catch (err) {
    console.log(err);
    const error = new HttpError("오류가 발생했습니다", 500);
    return next(error);
  }
  if (!item) {
    const error = new HttpError("존재하지 않는 아이템입니다", 404);
    return next(error);
  }
  const { seller, ...other } = item.toObject({ getters: true });

  const result = {
    ...other,
    // @ts-expect-error
    seller: item.seller.userName,
    // @ts-expect-error
    sellerId: item.seller._id,
  };
  res.json(result);
};

/** id(유저id)를 body로 받아가 가지고 있는 정보를 리턴*/
export const getItemsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.id;

  let findCartItemsByUserId;
  try {
    findCartItemsByUserId = await Items.find({ seller: userId });
  } catch (err) {
    next(new HttpError("아이템을 찾지 못했습니다", 500));
  }
  if (!findCartItemsByUserId) {
    next(new HttpError("존재하지 않는 아이템입니다", 404));
  } else
    return res
      .status(200)
      .json(
        findCartItemsByUserId.map((Items) => Items.toObject({ getters: true }))
      );
};

export const getItemsByQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = Number(req.query.pageNum) || 1;
  const number = Number(req.query.num) || 5;

  let limitedItems;
  if (!page || !number) {
    next(new HttpError("잘못된 파라미터입니다", 400));
  } else
    try {
      limitedItems = await Items.find({})
        .skip((page - 1) * number)
        .limit(number);
    } catch (err) {
      next(new HttpError("아이템을 찾지 못했습니다", 500));
    }
  if (!limitedItems) {
    next(new HttpError("존재하지 않는 아이템입니다", 404));
  } else
    return res
      .status(200)
      .json(limitedItems.map((Items) => Items.toObject({ getters: true })));
};

export const getAllItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let foundedItems;
  try {
    foundedItems = await Items.find();
  } catch (err) {
    next(new HttpError("아이템을 찾지 못했습니다", 500));
  }
  if (!foundedItems) {
    next(new HttpError("존재하지 않는 아이템입니다", 404));
  } else
    return res
      .status(200)
      .json(foundedItems.map((Items) => Items.toObject({ getters: true })));
};
