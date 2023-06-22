import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

dotenv.config();
const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId:  process.env.accessKeyId as string,
    secretAccessKey:  process.env.secretAccessKey as string,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "jobkae-ecommerce-static",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});
export default upload;
