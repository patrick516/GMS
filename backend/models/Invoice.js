const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("Invoice", invoiceSchema);
