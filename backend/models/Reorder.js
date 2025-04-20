const mongoose = require("mongoose");

const reorderSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  systemUserName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Done"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Reorder", reorderSchema);
