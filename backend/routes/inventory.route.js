const express = require("express");
const router = express.Router();
const {
  addInventory,
  getInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/productController");

const verifyToken = require("../middleware/verifyToken");

router.post("/add", verifyToken, addInventory);
router.get("/", verifyToken, getInventory);
router.put("/update/:id", verifyToken, updateInventory);
router.delete("/:id", verifyToken, deleteInventory);

module.exports = router;
