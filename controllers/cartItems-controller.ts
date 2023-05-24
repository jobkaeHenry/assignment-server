import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Items } from "../models/Items";
import HttpError from "../models/error";
import { User } from "../models/user";

export const addCartItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { itemId } = req.body;

  const userId = req.userData?.userId;

  //express-validator 추가하기

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

  let itemToAdd;
  try {
    itemToAdd = await Items.findOne({ _id: itemId });
  } catch {
    return next(new HttpError("해당 아이템을 조회하지 못했습니다", 500));
  }
  if (!itemToAdd) {
    return next(new HttpError("존재하지 않는 아이템입니다", 404));
  }
  // 실존할 경우
  try {
    // @ts-expect-error
    ActualUser.cartItems.push({ itemInfo: itemToAdd, quantity: 1 });
    ActualUser.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError("저장에 실패했습니다", 500);
    return next(error);
  }
  res.status(201).json({ id: itemToAdd.toObject({ getters: true })._id });
};

/** 아이템 uid가 일치하는 아이템 1개 를 찾아 리턴하는 컨트롤러 */
// export const getCartItemsById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const CartItemsID = req.params.id;
//   let cartItems;
//   try {
//     cartItems = await Items.findById(CartItemsID).populate("Seller");
//   } catch (err) {
//     console.log(err);
//     const error = new HttpError("오류가 발생했습니다", 500);
//     return next(error);
//   }
//   if (!cartItems) {
//     const error = new HttpError("존재하지 않는 아이템입니다", 404);
//     return next(error);
//   }
//   const { seller, ...other } = cartItems.toObject({ getters: true });
//   // @ts-expect-error
//   const result = { ...other, seller: CartItems.seller?.nickName };
//   res.json(result);
// };

/** id(유저id)를 body로 받아가 가지고 있는  정보를 리턴*/
export const getCartItemsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userData.userId;
  let user;
  try {
    user = await User.findById(userId).populate('cartItems')
  } catch {
    next(new HttpError("유저를 찾지 못했습니다", 500));
  }
  if (!user) {
    next(new HttpError("존재하지 않는 유저입니다", 404));
  } else {
    const cartItems = await Promise.all(user.cartItems.map(async (cartItem) => {
      const itemId = cartItem.itemInfo;
    
      const itemInfo = await Items.findOne({_id: itemId});
    
      const quantity = cartItem.quantity;
      return {itemInfo, quantity};
    }));
    return res.status(200).json(cartItems);
  }
};

export const deleteCartItemsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const CartItemsId = req.params.id;
  const userId = req.userData.userId;
  let user
    try {
      user = await User.findById(userId).populate('cartItems')
    } catch (error) {
      return next(new HttpError("유저를 조회하지 못했습니다", 500));
    }
    if(!user){
      return  next(new HttpError("존재하지 않는 유저입니다", 404));
    }
      else if (user.id !== userId) {
    return next(new HttpError("삭제 권한이 없습니다", 401));
  } 
  let newCartList = user.cartItems.filter((e:any)=>{
    e._id === CartItemsId
  })
  if(newCartList.length === user.cartItems.length){
    return next(new HttpError("존재하지 않는 아이템 입니다", 400));
  }
  // 권한확인
    try {
      user.cartItems = newCartList
      user.save()
    } catch (error) {
      return next(new HttpError("삭제에 실패했습니다", 500));
    }
  res.status(201).json({ message: "삭제가 완료되었습니다" });
};
