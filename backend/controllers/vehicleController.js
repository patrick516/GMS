const Vehicle = require("../models/Vehicle");
const Customer = require("../models/Customer");

exports.addVehicle = async (req, res) => {
  try {
    const {
      customerId,
      plateNumber,
      model,
      brand,
      engineNumber,
      color,
      notes,
      createdAt,
      customerName,
      technicianId,
      supervisorId,
    } = req.body;

    console.log("Incoming vehicle data:", req.body);

    if (!customerId) {
      return res.status(400).json({ message: "Customer is required" });
    }

    const newVehicle = await Vehicle.create({
      customerId,
      plateNumber: plateNumber.trim(),
      model,
      brand,
      engineNumber: engineNumber?.trim(),
      color,
      notes,
      createdAt,
      customerName,
      technicianId: technicianId || null,
      supervisorId: supervisorId || null,
    });

    res.status(201).json({ success: true, data: newVehicle });
  } catch (err) {
    console.error("Error adding vehicle:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to save vehicle",
    });
  }
};

exports.getCustomersWithVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}, "customerId customerName");

    const customerIds = vehicles
      .filter((v) => v.customerId)
      .map((v) => v.customerId.toString());

    const manualNames = vehicles
      .filter((v) => !v.customerId && v.customerName)
      .map((v) => ({
        name: v.customerName,
        id: null,
        phone: "",
        email: "",
      }));

    const dbCustomers = await Customer.find(
      { _id: { $in: customerIds } },
      { _id: 1, name: 1, fullName: 1, email: 1, phone: 1 }
    );

    const mapped = dbCustomers.map((c) => ({
      id: c._id,
      name: c.fullName || c.name,
      phone: c.phone || "",
      email: c.email || "",
    }));

    const all = [...mapped, ...manualNames];

    res.status(200).json({ success: true, data: all });
  } catch (err) {
    console.error(" Failed to get customers with vehicles:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate("customerId", "fullName")
      .populate("technicianId", "fullName")
      .populate("supervisorId", "fullName")
      .lean();

    res.status(200).json({ success: true, data: vehicles });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch vehicles" });
  }
};
