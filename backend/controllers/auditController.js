const AuditLog = require("../models/AuditLog");

exports.deleteLogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await AuditLog.deleteMany({ userId });
    res.status(200).json({ success: true, message: "Logs cleared" });
  } catch (err) {
    console.error("Error deleting logs:", err);
    res.status(500).json({
      success: false,
      message: "Failed to clear logs",
      error: err.message,
    });
  }
};
