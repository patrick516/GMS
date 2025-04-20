const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: String,
  phone: String,
  position: { type: String, required: true },
  type: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract"],
    required: true,
  },
  salary: { type: Number, required: true },
  startDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Employee", employeeSchema);
