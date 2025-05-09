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

    if (!customerId && !customerName) {
      return res
        .status(400)
        .json({ message: "Either customerId or customerName is required" });
    }
    const newVehicle = await Vehicle.create({
      customerId: customerId || undefined, // avoids saving empty string/null
      customerName,
      plateNumber: plateNumber?.trim(),
      model,
      brand,
      engineNumber: engineNumber?.trim(),
      color,
      notes,
      createdAt,
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
    const vehicles = await Vehicle.find({ isDone: { $ne: true } }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: vehicles });
  } catch (err) {
    console.error("Error getting vehicles:", err);
    res.status(500).json({ success: false });
  }
};

// vehicleController.js
exports.markVehicleAsDone = async (req, res) => {
  try {
    console.log("🔧 Marking vehicle done →", req.params.id);

    const updated = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        isDone: true,
        completedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      console.log("❌ No vehicle found with this ID");
      return res.status(404).json({ success: false, message: "Not found" });
    }

    console.log("✅ Vehicle marked as done:", updated);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error marking done:", err);
    res.status(500).json({ success: false });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    await Vehicle.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Vehicle deleted" });
  } catch (err) {
    console.error("Failed to delete vehicle", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCompletedVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isDone: true }).populate(
      "customerId",
      "fullName email phone"
    );
    const enriched = vehicles.map((v) => ({
      ...v._doc,
      customerName: v.customerId?.fullName || v.customerName,
      customerEmail: v.customerId?.email || "",
      customerPhone: v.customerId?.phone || "",
    }));
    res.status(200).json({ success: true, data: enriched });
  } catch (err) {
    console.error("Failed to load completed vehicles:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
