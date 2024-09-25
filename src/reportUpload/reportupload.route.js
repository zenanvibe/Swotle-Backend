const express = require("express");
const router = express.Router();
const authController = require("./reportupload.controller");
const authenticateJwt = require("../middleware/authenticateJWT");
const { uploadOnline } = require("../middleware/fileUpload"); // Assuming uploadOnline is your custom middleware
const multer = require("multer");
const path = require("path");

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the extension
  },
});

const upload = multer({ storage: storage });

// Upload report route
router.post(
  "/upload/report",
  uploadOnline.single("file"),
  authController.uploadReport
);

module.exports = router;
