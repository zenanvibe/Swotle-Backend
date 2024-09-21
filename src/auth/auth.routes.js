const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authenticateJwt = require("../middleware/authenticateJWT");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the extension
  },
});

const upload = multer({ storage: storage });


router.post("/signup", authController.signup);
router.post("/employee/signup", upload.single("file"), authController.employeeSignup);
router.post("/login", authController.login);
router.post("/send-verification-link", authController.sendVerificationLink);
router.get("/verify/:verificationToken", authController.verifyToken);   

module.exports = router;
