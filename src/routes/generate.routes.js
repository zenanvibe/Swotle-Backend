const express = require("express");
const traitController = require("../controller/generate.controller");

const router = express.Router();

router.post('/traits', traitController.getTraits);

module.exports = router;
