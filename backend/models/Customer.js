// models/Customer.js
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    purchasedInventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantityPurchased: { type: Number, default: 1 },
    costPricePerUnit: { type: Number, default: 0 },
    salePricePerUnit: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    totalSaleAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    payment: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    isDebtor: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
