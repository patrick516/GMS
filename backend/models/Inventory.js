const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    name: String,
    brand: String,
    quantity: Number,
    costPerUnit: Number,
    anyCostIncurred: Number,
    descriptionOfCost: String,
    salePricePerUnit: Number,
    totalCosts: String,
    totalCostOfSales: String,
    image: String,

    //  New: Optional link to supplier
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema, "inventories");
