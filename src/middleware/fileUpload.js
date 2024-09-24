const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
dotenv.config();

// S3 setup for DigitalOcean Spaces
const s3 = new S3Client({
  forcePathStyle: false,
  region: "blr1",
  endpoint: "https://blr1.digitaloceanspaces.com",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Online upload: Upload file to DigitalOcean Spaces
const uploadOnline = multer({
  storage: multerS3({
    s3: s3,
    bucket: "neptunezen", // Replace with your bucket name
    acl: "public-read", // Make the file public
    key: function (req, file, cb) {
      const folderPath = "zenanvibe/swotle/handwritting/"; // Folder path in DigitalOcean Spaces
      const fileName = Date.now() + "_" + file.originalname; // Use timestamp to avoid collisions
      cb(null, folderPath + fileName);
    },
  }),
});

// Offline upload: Store file locally on the server
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads"); // Local upload directory
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + "-";
    cb(null, uniquePrefix + file.originalname); // Unique filename with timestamp
  },
});

const uploadOffline = multer({ storage: storage });

// Export both the online and offline upload methods
module.exports = { uploadOffline, uploadOnline };
