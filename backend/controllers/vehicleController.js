const Vehicle = require("../models/Vehicle");
const Customer = require("../models/Customer");
const logAudit = require("../utils/logAudit");

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
    console.log("AUDIT -> req.user:", req.user);

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
    await logAudit(req.user, "Added Vehicle", {
      plateNumber: newVehicle.plateNumber,
      model: newVehicle.model,
      customer: newVehicle.customerName,
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
    const customers = await Customer.aggregate([
      {
        $lookup: {
          from: "vehicles",
          let: { customerId: "$_id", fullName: "$fullName" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$customerId", "$$customerId"] },
                    {
                      $and: [
                        { $eq: ["$customerId", null] },
                        { $eq: ["$customerName", "$$fullName"] },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                plateNumber: 1,
                model: 1,
              },
            },
          ],
          as: "vehicles",
        },
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          phone: 1,
          vehicles: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: customers });
  } catch (err) {
    console.error("Error fetching customers with vehicles:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch customers" });
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
      console.log(" No vehicle found with this ID");
      return res.status(404).json({ success: false, message: "Not found" });
    }

    console.log("Vehicle marked as done →", {
      id: updated._id,
      isDone: updated.isDone,
      completedAt: updated.completedAt,
    });
    await logAudit(req.user, "Marked Vehicle as Done", {
      plateNumber: updated.plateNumber,
      completedAt: updated.completedAt,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error marking done:", err);
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
