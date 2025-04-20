const mongoose = require("mongoose");

const Customer = require("../models/Customer");

exports.addCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      purchasedInventoryId,
      quantityPurchased = 1,
      salePricePerUnit = 0,
      payment = 0,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(purchasedInventoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID provided",
      });
    }

    const totalSaleAmount = quantityPurchased * salePricePerUnit;
    const balance = totalSaleAmount - payment;

    const customer = await Customer.create({
      name,
      email,
      phone,
      purchasedInventoryId: new mongoose.Types.ObjectId(purchasedInventoryId),
      quantityPurchased,
      salePricePerUnit,
      totalSaleAmount,
      payment,
      balance,
      isDebtor: balance > 0,
      paymentStatus: balance <= 0 ? "Paid" : "Pending",
    });

    res.status(201).json({ success: true, customer });
  } catch (err) {
    console.error(" FULL ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Error adding customer",
      stack: err.stack,
    });
  }
};

exports.updateCustomerPayment = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    if (amount > customer.balance) {
      return res
        .status(400)
        .json({ success: false, message: "Payment exceeds remaining balance" });
    }

    customer.payment += amount;
    customer.balance -= amount;
    customer.paymentStatus = customer.balance <= 0 ? "Paid" : "Pending";
    customer.isDebtor = customer.balance > 0;

    await customer.save();

    res.status(200).json({ success: true, customer });
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ success: false, message: "Error updating payment" });
  }
};

exports.getDebtors = async (req, res) => {
  try {
    const debtors = await Customer.find({ isDebtor: true }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: debtors });
  } catch (err) {
    console.error("Error fetching debtors:", err);
    res.status(500).json({ success: false, message: "Error fetching debtors" });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch customers" });
  }
};

// GET /api/customers/summary
exports.getCustomerSummary = async (req, res) => {
  try {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    const topSpender = await Customer.aggregate([
      {
        $group: {
          _id: "$name",
          totalSpent: { $sum: "$payment" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 1 },
    ]);

    res.status(200).json({
      success: true,
      newCustomers,
      topSpender: topSpender[0]?.totalSpent || 0,
    });
  } catch (err) {
    console.error("Error generating customer summary:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate customer summary",
    });
  }
};
