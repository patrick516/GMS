const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const { deleteLogsByUser } = require("../controllers/auditController");
const AuditLog = require("../models/AuditLog");

// Existing GET route
router.get("/logs", verifyToken, isAdmin, async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  try {
    const logs = await AuditLog.find(query)
      .populate("userId", "username email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to load audit logs" });
  }
});

router.delete("/logs/:userId", verifyToken, deleteLogsByUser);

module.exports = router;
