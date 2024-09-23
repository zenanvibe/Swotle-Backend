const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileController = require("./uploadfiles.controller");

const storage = multer.memoryStorage(); // Store files in memory for processing

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit file size to 100MB for example
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accept all files
  },
});

router.post("/upload", upload.single("file"), fileController.uploadFile);

module.exports = router;
