const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    plateNumber: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    brand: String,
    engineNumber: String,
    color: String,
    notes: String,
    createdAt: { type: Date, default: Date.now },
    customerName: String,

    isDone: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
