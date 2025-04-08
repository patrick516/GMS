const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  company: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Supplier", supplierSchema);
