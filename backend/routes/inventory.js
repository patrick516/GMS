const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

router.get("/stock-levels", inventoryController.getStockLevels);

module.exports = router;
