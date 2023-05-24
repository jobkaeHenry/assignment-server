import mongoose, { model, Schema } from "mongoose";

const ItemsSchema = new Schema({
  seller: { type: mongoose.Types.ObjectId, require: true, ref: "User" },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

export const Items = model("Items", ItemsSchema);
