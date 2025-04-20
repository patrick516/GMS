const express = require("express");
const router = express.Router();
const {
  createQuotation,
  getAllQuotations,
  archiveQuotation,
  markAsInvoiced,
  getQuotationSummary,
} = require("../controllers/quotationController");

router.post("/add", createQuotation);
router.get("/all", getAllQuotations);
router.patch("/archive/:id", archiveQuotation);
router.patch("/mark-invoiced/:id", markAsInvoiced);
router.get("/summary", getQuotationSummary);

module.exports = router;
