const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");



router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/admin/login", userController.adminLogin);
router.get("/", userController.getAllUsers)
router.get("/info/:userId", userController.getUserInfo);
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

module.exports = router;
