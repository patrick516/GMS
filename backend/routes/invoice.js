const express = require("express");
const router = express.Router();
const {
  addInvoice,
  getInvoiceById,
  getInvoiceSummary,
  getAllInvoices, // ✅ include it
} = require("../controllers/invoiceController");

router.post("/add", addInvoice);
router.get("/summary", getInvoiceSummary);
router.get("/all", getAllInvoices);
router.get("/:id", getInvoiceById);

module.exports = router;
