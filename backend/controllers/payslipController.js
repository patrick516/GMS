// controllers/payslipController.js
const Payslip = require("../models/Payslip");

// Save payslip
exports.addPayslip = async (req, res) => {
  try {
    const now = new Date();
    req.body.month = now.getMonth() + 1; // ✅ adds month
    req.body.year = now.getFullYear(); // ✅ adds year

    const payslip = await Payslip.create(req.body);
    res.status(201).json({ success: true, data: payslip });
  } catch (error) {
    console.error("❌ Failed to save payslip:", error);
    res.status(500).json({ success: false, message: "Failed to save payslip" });
  }
};

// Get all processed employee IDs (to filter out from pay queue)
exports.getProcessedEmployeeIds = async (req, res) => {
  const { month, year } = req.query;

  try {
    const payslips = await Payslip.find({ month, year }, "employeeId");
    const ids = payslips.map((p) => p.employeeId.toString());

    res.status(200).json({ success: true, data: ids });
  } catch (error) {
    console.error("Failed to fetch processed employee IDs:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch processed employees" });
  }
};

exports.getAllPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.find().populate("employeeId");
    res.status(200).json({ success: true, data: payslips });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch payslips" });
  }
};
exports.getMonthlyPayrollSummary = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const payslips = await Payslip.find({
      month: currentMonth,
      year: currentYear,
    });

    const summary = payslips.reduce(
      (acc, slip) => {
        acc.count += 1;
        acc.gross += slip.salary;
        acc.tax += slip.tax;
        acc.allowances += slip.allowances;
        acc.otherDeductions += slip.otherDeductions;
        acc.net += slip.netPay;
        return acc;
      },
      {
        count: 0,
        gross: 0,
        tax: 0,
        allowances: 0,
        otherDeductions: 0,
        net: 0,
      }
    );

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    console.error("Payroll summary error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate payroll summary" });
  }
};

exports.getMonthlyPayrollTrend = async (req, res) => {
  try {
    const months = 6; // Change to 3 or 12 if needed
    const now = new Date();
    const trend = [];

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const payslips = await Payslip.find({ month, year });

      const netPayTotal = payslips.reduce(
        (sum, slip) => sum + (slip.netPay || 0),
        0
      );

      trend.push({
        label: `${date.toLocaleString("default", { month: "short" })} ${year}`,
        netPay: netPayTotal,
      });
    }

    res.status(200).json({ success: true, data: trend.reverse() });
  } catch (err) {
    console.error("Payroll trend error:", err);
    res.status(500).json({ message: "Failed to load payroll trend" });
  }
};
