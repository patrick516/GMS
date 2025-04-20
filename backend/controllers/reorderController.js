const { sendWhatsApp } = require("../utils/twilio");
const Supplier = require("../models/Supplier");

const Reorder = require("../models/Reorder");

exports.sendReorderToSupplier = async (req, res) => {
  try {
    const { supplierName, supplierPhone, productName, systemUserName } =
      req.body;

    const message = `Hi ${supplierName}, this is ${systemUserName} from Garage. We are low on ${productName} and would like to reorder.`;

    // Send WhatsApp
    await sendWhatsApp(supplierPhone, message);

    // Save reorder log
    const supplier = await Supplier.findOne({ phone: supplierPhone });
    await Reorder.create({
      supplierId: supplier?._id || null,
      productName,
      message,
      systemUserName,
      status: "Pending",
    });

    res
      .status(200)
      .json({ success: true, message: "WhatsApp sent and reorder logged" });
  } catch (error) {
    console.error(" WhatsApp send error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to send WhatsApp",
      error: error.message,
    });
  }
};
exports.markReorderAsDone = async (req, res) => {
  try {
    const { id } = req.params;
    await Reorder.findByIdAndUpdate(id, { status: "Done" });
    res.status(200).json({ success: true, message: "Reorder marked as done" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update status" });
  }
};

exports.getAllReorders = async (req, res) => {
  try {
    const reorders = await Reorder.find()
      .populate("supplierId")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reorders });
  } catch (err) {
    console.error("Error fetching reorder logs:", err);
    res
      .status(500)
      .json({ success: false, message: "Could not retrieve reorder list" });
  }
};
