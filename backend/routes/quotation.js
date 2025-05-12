const express = require("express");
const router = express.Router();
const {
  createQuotation,
  getAllQuotations,
  archiveQuotation,
  markAsInvoiced,
  getQuotationSummary,
} = require("../controllers/quotationController");

const verifyToken = require("../middleware/verifyToken");

router.post("/add", verifyToken, createQuotation);
router.get("/all", verifyToken, getAllQuotations);
router.patch("/archive/:id", verifyToken, archiveQuotation);
router.patch("/mark-invoiced/:id", verifyToken, markAsInvoiced);
router.get("/summary", verifyToken, getQuotationSummary);

module.exports = router;
