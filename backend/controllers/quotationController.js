const Quotation = require("../models/Quotation");
const logAudit = require("../utils/logAudit");

exports.createQuotation = async (req, res) => {
  try {
    const newQuote = await Quotation.create(req.body);

    //  Log the quotation creation
    await logAudit(req.user, "Created Quotation", {
      customerName: newQuote.customerName,
      problemDescription: newQuote.problemDescription,
      serviceCost: newQuote.serviceCost,
      status: newQuote.status || "pending",
    });

    res.status(201).json({ success: true, data: newQuote });
  } catch (err) {
    console.error("Error saving quotation:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to save quotation" });
  }
};

// Get all quotations (that are not archived)
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({
      status: { $nin: ["archived", "invoiced"] },
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: quotations });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch quotations" });
  }
};
// Mark quotation as invoiced
exports.markAsInvoiced = async (req, res) => {
  try {
    const id = req.params.id;
    await Quotation.findByIdAndUpdate(id, {
      status: "invoiced",
      paymentStatus: "Paid",
    });
    res
      .status(200)
      .json({ success: true, message: "Quotation marked as invoiced" });
  } catch (err) {
    console.error("Failed to mark quotation as invoiced", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// Archive quotation after viewing invoice

exports.archiveQuotation = async (req, res) => {
  try {
    await Quotation.findByIdAndUpdate(req.params.id, { archived: true });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Archive failed" });
  }
};

// Get quotation summary for reports
exports.getQuotationSummary = async (req, res) => {
  try {
    const total = await Quotation.countDocuments();

    const valueAgg = await Quotation.aggregate([
      {
        $group: {
          _id: null,
          value: { $sum: "$serviceCost" },
        },
      },
    ]);

    const value = valueAgg[0]?.value || 0;

    res.status(200).json({ success: true, total, value });
  } catch (error) {
    console.error("Error generating quotation summary:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get quotation summary" });
  }
};
