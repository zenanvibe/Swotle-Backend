const express = require("express");
const router = express.Router();
const companyController = require("./company.controller");
const authenticateJwt = require("../middleware/authenticateJWT");

router.post("/create/", authenticateJwt, companyController.createCompany);
router.get("/", authenticateJwt, companyController.getAllCompanies);
router.get("/:companyId", authenticateJwt, companyController.getAllStaffs);

router.get("/totaldata",authenticateJwt, companyController.getTotalData);

// router.post("/create/manager", authenticateJwt, companyController.createManager);
// router.post("/create/user", authenticateJwt, companyController.createUser);

module.exports = router;