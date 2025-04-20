const express = require("express");
const router = express.Router();
const {
  getInventoryReport,
  getInventoryReportDetailed,
  getStockLevels,
} = require("../controllers/inventoryController");

router.get("/report", getInventoryReport);
router.get("/report-detailed", getInventoryReportDetailed);
router.get("/stock-levels", getStockLevels);

module.exports = router;
