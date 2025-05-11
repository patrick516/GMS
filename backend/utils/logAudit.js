const AuditLog = require("../models/AuditLog");

const logAudit = async (user, action, details = {}) => {
  try {
    await AuditLog.create({
      userId: user.id,
      action,
      details,
    });
  } catch (err) {
    console.error("Audit logging failed:", err);
  }
};

module.exports = logAudit;
