const express = require("express");
const traitController = require("../controller/generate.controller");

const router = express.Router();

router.post("/traits", traitController.getTraits);
router.post("/generatePDF", traitController.getTraitspdf);
router.get("/positivetraits", traitController.getPositiveTraits);
router.get("/negativetraits", traitController.getNegativeTraits);
router.get("/get_thinking_patterns", traitController.getThinkingPatterns);
router.post("/post_trait_analysis", traitController.postTraitAnalysis);

module.exports = router;
