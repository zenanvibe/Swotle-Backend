const express = require("express");
const router = express.Router();
const clientController = require("../controller/client.controller");

router.post("/signup", clientController.signup);
router.post("/login", clientController.login);
// router.post("/admin/login", clientController.adminLogin);
router.get("/", clientController.getAllUsers);
router.get("/info/:userId", clientController.getUserInfo);
router.put("/:userId", clientController.updateUser);
router.delete("/:userId", clientController.deleteUser);

module.exports = router;
