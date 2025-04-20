const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
  customerName: String,
  phone: String,
  email: String,
  plateNumber: String,
  model: String,
  problemDescription: String,
  serviceCost: Number,
  status: { type: String, default: "pending" },
  paymentStatus: { type: String, default: "Unpaid" },
  createdAt: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false },
});

module.exports = mongoose.model("Quotation", quotationSchema);
