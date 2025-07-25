const Employee = require("../models/Employee");
const logAudit = require("../utils/logAudit");

exports.addEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    await logAudit(req.user, "Added Employee", {
      fullName: employee.fullName,
      position: employee.position,
      salary: employee.salary,
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error("Error adding employee:", error);

    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern?.email) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }

    res.status(500).json({ success: false, message: "Failed to add employee" });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching employees" });
  }
};
