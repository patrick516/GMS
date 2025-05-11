const Debtor = require("../models/Debtor");
const logAudit = require("../utils/logAudit");

exports.getDebtors = async (req, res) => {
  try {
    const debtors = await Debtor.find().sort({ createdAt: -1 });

    await logAudit(req.user, "Viewed Debtor List", {
      count: debtors.length,
    });

    res.status(200).json({ success: true, data: debtors });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch debtors",
      error: err.message,
    });
  }
};
