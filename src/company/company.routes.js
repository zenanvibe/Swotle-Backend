const express = require("express");
const router = express.Router();
const companyController = require("./company.controller");
const companyModel = require("./company.model");
const authenticateJwt = require("../middleware/authenticateJWT");

router.post("/create/", authenticateJwt, companyController.createCompany);
router.get("/", authenticateJwt, companyController.getAllCompanies);
router.get("/:companyId", authenticateJwt, companyController.getAllStaffs);
router.get(
  "/staff/:companyId",
  authenticateJwt,
  companyController.getAllStaffsByCompanyId
);
router.put("/users/:userId", authenticateJwt, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    // console.log('Received update request:', { userId, updates });
    await companyModel.updateUser(userId, updates);
    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.delete("/users/:userId", authenticateJwt, async (req, res) => {
  try {
    const { userId } = req.params;
    await companyModel.deleteUser(userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put("/:companyId", authenticateJwt, companyController.updateCompany);
router.delete("/:companyId", authenticateJwt, companyController.deleteCompany);

router.get(
  "/totaldata/:companyId",
  authenticateJwt,
  companyController.getTotalData
);
router.get(
  "/admintotaldata/:companyId",
  authenticateJwt,
  companyController.getadminTotalData
);
router.get(
  "/admintabledata/:companyId",
  authenticateJwt,
  companyController.getadminTableData
);

// router.post("/create/manager", authenticateJwt, companyController.createManager);
// router.post("/create/user", authenticateJwt, companyController.createUser);

module.exports = router;
