const express = require("express");
const router = express.Router();
const {
  addInventory,
  getInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/productController");

router.post("/add", addInventory);
router.get("/", getInventory);
router.put("/update/:id", updateInventory);
router.delete("/:id", deleteInventory);

module.exports = router;

module.exports = router;
