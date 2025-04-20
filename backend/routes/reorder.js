const express = require("express");
const router = express.Router();
const {
  sendReorderToSupplier,
  getAllReorders,
  markReorderAsDone,
} = require("../controllers/reorderController");

const {} = require("../controllers/reorderController");

router.post("/whatsapp", sendReorderToSupplier);

router.get("/list", getAllReorders);
router.put("/mark-done/:id", markReorderAsDone);

module.exports = router;
