const mongoose = require("mongoose");

const debtorSchema = new mongoose.Schema({
  customerId: mongoose.Schema.Types.ObjectId,
  name: String,
  email: String,
  phone: String,
  amountOwed: Number,
  status: String,
  inventory: String,
  quantity: Number,
  salePricePerUnit: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Debtor", debtorSchema);
