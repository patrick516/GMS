const express = require("express");
const router = express.Router();
const {
  sendReorderToSupplier,
  getAllReorders,
  markReorderAsDone,
} = require("../controllers/reorderController");

const verifyToken = require("../middleware/verifyToken");

router.post("/whatsapp", verifyToken, sendReorderToSupplier);
router.get("/list", verifyToken, getAllReorders);
router.put("/mark-done/:id", verifyToken, markReorderAsDone);

module.exports = router;
