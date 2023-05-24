import mongoose, { model, Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new Schema({
  // unique 를 추가 할 경우, 이메일에 고유 키값을 생성해 빠르게 찾을 수 있음
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true, minlength: 8 },
  userName: { type: String, require: true },
  isSeller: { type: Boolean, require: true, default: false },
  items: [{ type: mongoose.Types.ObjectId, require: true, ref: "items" }],
  cartItems: [
    {
      itemInfo: { type: mongoose.Types.ObjectId, require: true, ref: "items" },
      quantity: { type: Number, requireed: true },
    },
  ],
  refreshToken: { type: String, require: false },
});
// 고유 값인지 검증하는 mongoose Validator
userSchema.plugin(uniqueValidator);

export const User = model("User", userSchema);
