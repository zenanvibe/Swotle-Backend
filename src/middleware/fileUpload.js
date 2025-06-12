const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
dotenv.config();

// S3 setup for AWS
const s3 = new S3Client({
  region: "us-east-1", // Your S3 bucket region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Online upload: Upload file to AWS S3
const uploadOnline = multer({
  storage: multerS3({
    s3: s3,
    bucket: "swotle-uploads", // Your bucket name
    acl: "public-read",
    key: function (req, file, cb) {
      const folderPath = "swotle/uploads/handwritting/"; // Your custom S3 folder
      const fileName = Date.now() + "_" + file.originalname;
      cb(null, folderPath + fileName);
    },
  }),
});

// Offline upload: Store file locally
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads");
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + "-";
    cb(null, uniquePrefix + file.originalname);
  },
});

const uploadOffline = multer({ storage: storage });

module.exports = { uploadOffline, uploadOnline };
