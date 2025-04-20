const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/inventory/report", reportController.getInventoryReport);

router.get("/summary", reportController.getReportSummary);

module.exports = router;
