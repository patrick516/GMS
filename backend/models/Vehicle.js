const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
      default: null,
    },

    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: false,
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: false,
    },
    plateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    model: {
      type: String,
      required: true,
    },
    brand: String,
    engineNumber: String,
    color: String,
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    customerName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
