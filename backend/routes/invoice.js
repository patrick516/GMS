const express = require("express");
const router = express.Router();
const {
  addInvoice,
  getInvoiceById,
  getInvoiceSummary,
  getAllInvoices,
} = require("../controllers/invoiceController");

const verifyToken = require("../middleware/verifyToken");

router.post("/add", verifyToken, addInvoice);
router.get("/summary", verifyToken, getInvoiceSummary);
router.get("/all", verifyToken, getAllInvoices);
router.get("/:id", verifyToken, getInvoiceById);

module.exports = router;
