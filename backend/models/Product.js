const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    quantity: Number,
    costPricePerUnit: Number,
    salePricePerUnit: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
