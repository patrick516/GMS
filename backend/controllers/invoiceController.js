const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const logAudit = require("../utils/logAudit");

exports.addInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create({
      ...req.body,
      status: "invoiced",
      paymentStatus: "Paid",
      createdAt: new Date(),
    });
    await logAudit(req.user, "Created Invoice", {
      customerName: invoice.customerName,
      amount: invoice.serviceCost || invoice.total,
      paymentStatus: invoice.paymentStatus,
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    console.error("Error saving invoice:", err);
    res.status(500).json({ success: false, message: "Failed to save invoice" });
  }
};

exports.getInvoiceById = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Invoice ID" });
  }

  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }
    res.json({ success: true, data: invoice });
  } catch (err) {
    console.error("Error fetching invoice:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json({ success: true, data: invoices });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch invoices" });
  }
};

exports.getInvoiceSummary = async (req, res) => {
  try {
    const invoices = await Invoice.find();

    const total = invoices.length;
    const paidInvoices = invoices.filter((i) => i.paymentStatus === "Paid");
    const paid = paidInvoices.length;
    const unpaid = total - paid;

    const totalRevenue = paidInvoices.reduce(
      (sum, i) => sum + (i.serviceCost || 0),
      0
    );

    res.json({ total, paid, unpaid, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: "Error generating summary" });
  }
};
