const express = require("express");
const router = express.Router();
const {
  addSupplier,
  getSuppliers,
} = require("../controllers/supplierController");

const verifyToken = require("../middleware/verifyToken");

router.post("/add", verifyToken, addSupplier);
router.get("/", verifyToken, getSuppliers);

module.exports = router;
