const express = require("express");
const router = express.Router();
const { sendEmail } = require("./email.controller");

// Define a POST route to send an email
router.post("/send-email", sendEmail);

module.exports = router;
