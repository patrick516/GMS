const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  daysAbsent: Number,
  tax: Number,
  allowances: Number,
  otherDeductions: Number,
  netPay: Number,
  salary: Number,
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  dateProcessed: {
    type: Date,
    default: Date.now,
  },
});

exports.addPayslip = async (req, res) => {
  try {
    const now = new Date();

    req.body.month = now.getMonth() + 1;
    req.body.year = now.getFullYear();

    const payslip = await Payslip.create(req.body);
    res.status(201).json({ success: true, data: payslip });
  } catch (error) {
    console.error(" Failed to save payslip:", error);
    res.status(500).json({ success: false, message: "Failed to save payslip" });
  }
};

module.exports = mongoose.model("Payslip", payslipSchema);
