const express = require("express");
const traitController = require("./traits.controller");
const authenticateJwt = require("../middleware/authenticateJWT");


const router = express.Router();

router.get("/positive", authenticateJwt, traitController.getPositiveTraits);
router.get("/negative", authenticateJwt, traitController.getNegativeTraits);
router.get("/thinkingPattern", authenticateJwt, traitController.getThinkingPatterns);

module.exports = router;
