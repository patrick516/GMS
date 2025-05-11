const express = require("express");
const router = express.Router();
const {
  addPayslip,
  getProcessedEmployeeIds,
  getAllPayslips,
  getMonthlyPayrollSummary,
  getMonthlyPayrollTrend,
} = require("../controllers/payslipController");

const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

router.post("/add", verifyToken, isAdmin, addPayslip);
router.get("/processed", verifyToken, getProcessedEmployeeIds); // optional
router.get("/all", verifyToken, getAllPayslips); // optional
router.get("/monthly", verifyToken, getMonthlyPayrollSummary); // optional
router.get("/trend", verifyToken, getMonthlyPayrollTrend); // optional

module.exports = router;
