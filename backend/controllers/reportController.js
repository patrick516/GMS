const Inventory = require("../models/Inventory");
const Customer = require("../models/Customer");
const Quotation = require("../models/Quotation");
const Invoice = require("../models/Invoice");

//  INVENTORY REPORT
exports.getInventoryReport = async (req, res) => {
  try {
    console.log("USING CORRECT REPORT CONTROLLER ");

    const inventories = await Inventory.find();
    const customers = await Customer.find();

    let totalPurchased = 0;
    let totalSold = 0;
    let totalProfit = 0;

    const detailed = [];

    inventories.forEach((inv) => {
      const purchaseValue = inv.quantity * inv.purchasePrice;
      const saleValue = inv.quantity * inv.salePricePerUnit;
      const profit = saleValue - purchaseValue;

      totalPurchased += purchaseValue;
      totalProfit += profit;

      const soldQty = customers
        .filter(
          (c) => c.purchasedInventoryId?.toString() === inv._id.toString()
        )
        .reduce((sum, c) => sum + (c.quantityPurchased || 0), 0);

      totalSold += soldQty;

      detailed.push({
        name: inv.name,
        quantity: inv.quantity,
        purchasePrice: inv.purchasePrice,
        salePrice: inv.salePricePerUnit,
        purchaseValue,
        saleValue,
        profit,
        soldQty,
      });
    });

    // 👇 Log the detailed list and count
    console.log(" DETAILED INVENTORY:", detailed.length, detailed);

    res.status(200).json({
      purchased: totalPurchased,
      sold: totalSold,
      profit: totalProfit,
      detailed,
    });
  } catch (err) {
    console.error(" Error generating inventory report:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// QUOTATION + INVOICE REPORT
exports.getReportSummary = async (req, res) => {
  try {
    const totalQuotations = await Quotation.countDocuments();
    const totalInvoices = await Invoice.countDocuments();

    const quotationSum = await Quotation.aggregate([
      { $group: { _id: null, total: { $sum: "$serviceCost" } } },
    ]);

    const invoiceSum = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$serviceCost" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalQuotations,
        totalInvoices,
        totalQuotationAmount: quotationSum[0]?.total || 0,
        totalInvoiceAmount: invoiceSum[0]?.total || 0,
        difference: (quotationSum[0]?.total || 0) - (invoiceSum[0]?.total || 0),
      },
    });
  } catch (err) {
    console.error("Report generation error:", err);
    res.status(500).json({ success: false, message: "Report failed" });
  }
};
