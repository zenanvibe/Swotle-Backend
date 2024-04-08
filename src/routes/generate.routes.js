const express = require("express");
const traitController = require("../controller/generate.controller");

const router = express.Router();

router.post('/traits', traitController.getTraits);
router.post('/generatePDF', traitController.getTraitspdf);

module.exports = router;
