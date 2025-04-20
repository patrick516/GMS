const Employee = require("../models/Employee");

exports.addEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error("Error adding employee:", error);
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
