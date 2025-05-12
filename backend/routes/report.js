const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

const verifyToken = require("../middleware/verifyToken");

router.get(
  "/inventory/report",
  verifyToken,
  reportController.getInventoryReport
);
router.get("/summary", verifyToken, reportController.getReportSummary);

module.exports = router;
