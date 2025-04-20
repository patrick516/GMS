const express = require("express");
const router = express.Router();
const {
  addPayslip,
  getProcessedEmployeeIds,
  getAllPayslips,
  getMonthlyPayrollSummary,
  getMonthlyPayrollTrend,
} = require("../controllers/payslipController");

router.post("/add", addPayslip);
router.get("/processed", getProcessedEmployeeIds);
router.get("/all", getAllPayslips);
router.get("/monthly", getMonthlyPayrollSummary);
router.get("/trend", getMonthlyPayrollTrend);

module.exports = router;
