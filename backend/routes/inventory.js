const express = require("express");
const router = express.Router();
const {
  getInventoryReport,
  getInventoryReportDetailed,
  getStockLevels,
} = require("../controllers/inventoryController");

const verifyToken = require("../middleware/verifyToken");

router.get("/report", verifyToken, getInventoryReport);
router.get("/report-detailed", verifyToken, getInventoryReportDetailed);
router.get("/stock-levels", verifyToken, getStockLevels);

module.exports = router;
