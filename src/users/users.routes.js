const express = require("express");
const userController = require("./users.controller");
const authenticateJwt = require("../middleware/authenticateJWT");


const router = express.Router();

router.get('/', authenticateJwt, userController.getUserInfo);

module.exports = router;
