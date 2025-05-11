const Supplier = require("../models/Supplier");
const logAudit = require("../utils/logAudit");

exports.addSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, company, productId } = req.body;

    const supplier = await Supplier.create({
      name,
      email,
      phone,
      address,
      company,
      productId, // Optional, if you want to link to inventory
    });
    await logAudit(req.user, "Added Supplier", {
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      company: supplier.company,
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    console.error("Error adding supplier:", err);
    res.status(500).json({ success: false, message: "Failed to add supplier" });
  }
};
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: suppliers });
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch suppliers" });
  }
};
