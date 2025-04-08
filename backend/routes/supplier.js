const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");

// POST /api/supplier/add
router.post("/add", supplierController.addSupplier);

// GET /api/supplier/all
router.get("/all", supplierController.getSuppliers);

module.exports = router;
