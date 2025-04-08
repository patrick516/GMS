const Supplier = require("../models/Supplier");

// @desc    Add new supplier
exports.addSupplier = async (req, res) => {
  try {
    const { name, email, phone, company, address } = req.body;

    const newSupplier = new Supplier({
      name,
      email,
      phone,
      company,
      address,
    });

    await newSupplier.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Supplier added successfully",
        data: newSupplier,
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// @desc    Get all suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json({ success: true, data: suppliers });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        message: "Could not fetch suppliers",
        error: err.message,
      });
  }
};
