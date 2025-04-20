const express = require("express");
const router = express.Router();
const {
  addSupplier,
  getSuppliers,
} = require("../controllers/supplierController");

router.post("/add", addSupplier);
router.get("/", getSuppliers);

module.exports = router;
