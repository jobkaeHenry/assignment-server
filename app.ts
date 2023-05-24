import express from "express";
import type { ErrorRequestHandler } from "express";
import bodyParser from "body-parser";
import userRouter from "./routers/userRoute";
import helmet from "helmet";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cartItemsRoute from "./routers/cartItemsRoute";
import ItemsRoute from './routers/ItemsRoute'
import cors from "cors";
import ExpressMongoSanitize from "express-mongo-sanitize";
import apiLimiter from "./middleware/apiLimiter";


// 환경변수사용
dotenv.config();
const mongoDB_PW = process.env.MONGO_DB_PW;
const _port = 3000

// express
const app = express();
// 요청횟수 리미터
app.use(apiLimiter);
app.use(helmet());
// 바디파서
app.use(bodyParser.json());
// 리퀘스트 세니타이징
app.use(ExpressMongoSanitize());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT" ,"DELETE"],
  })
);

// 오픈된 라우팅
app.use("/cart", cartItemsRoute);
app.use("/user", userRouter);
app.use('/items',ItemsRoute)

// 에러핸들러
app.use(((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.code || 500).json({ message: err.message });
}) as ErrorRequestHandler);

mongoose
  .connect(
    `mongodb+srv://plugoServer:${mongoDB_PW}@plugoservercluster0.adb7kih.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    // 서버를 시작한다는 뜻
    app.listen(_port);
  })
  .catch((err) => {
    console.log(`!!!몽구스 에러 ${err}`);
  });
