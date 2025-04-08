const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where file is saved
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  console.log("req.file:", req.file);
  res.status(200).json({
    message: "File uploaded successfully!",
    file: req.file,
  });
});

module.exports = router;
