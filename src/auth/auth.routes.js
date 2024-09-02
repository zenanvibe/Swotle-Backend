const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authenticateJwt = require("../middleware/authenticateJWT");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/send-verification-link", authController.sendVerificationLink);
router.get("/verify/:verificationToken", authController.verifyToken);

module.exports = router;
