const express = require("express");
const router = express.Router();
const cardController = require("./card.controller");
const authenticateJwt = require("../middleware/authenticateJWT");

router.get(
  "/dashboard/user/:id",
  authenticateJwt,
  cardController.getUserCardData
);
router.get(
  "/dashboard/company/:companyId",
  authenticateJwt,
  cardController.getadminTotalData
);
router.get(
  "/dashboard/master",
  authenticateJwt,
  cardController.getAdminMasterCard
);

module.exports = router;
