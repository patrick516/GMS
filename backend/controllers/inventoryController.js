const Inventory = require("../models/Inventory");
const Customer = require("../models/Customer");

exports.getInventoryReportDetailed = async (req, res) => {
  try {
    const report = await Inventory.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "purchasedInventoryId",
          as: "sales",
        },
      },
      {
        $addFields: {
          totalSold: { $sum: "$sales.quantityPurchased" },
          revenue: {
            $multiply: [
              { $sum: "$sales.quantityPurchased" },
              "$salePricePerUnit",
            ],
          },
          cost: {
            $toDouble: "$totalCosts",
          },
          currentStock: {
            $subtract: ["$quantity", { $sum: "$sales.quantityPurchased" }],
          },
          profit: {
            $subtract: [
              {
                $multiply: [
                  { $sum: "$sales.quantityPurchased" },
                  "$salePricePerUnit",
                ],
              },
              { $toDouble: "$totalCosts" },
            ],
          },
          calculatedSales: {
            $multiply: ["$quantity", "$salePricePerUnit"],
          },
        },
      },
      {
        $project: {
          name: 1,
          brand: 1,
          quantity: 1,
          totalPurchased: "$quantity",
          totalSold: 1,
          currentStock: 1,
          revenue: 1,
          cost: 1,
          profit: 1,
          calculatedSales: 1,
        },
      },
    ]);
    console.log("Outgoing inventory data:", report[0]);

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    console.error("Error generating detailed inventory report:", err);
    res
      .status(500)
      .json({ success: false, message: "Error generating report" });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const inventoryCosts = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalCost: { $sum: { $toDouble: "$totalCosts" } },
        },
      },
    ]);

    const customerSales = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalSaleAmount" },
        },
      },
    ]);

    const purchased = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    const sold = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: "$quantityPurchased" } } },
    ]);

    const totalPurchased = purchased[0]?.total || 0;
    const totalSold = sold[0]?.total || 0;
    const totalCost = inventoryCosts[0]?.totalCost || 0;
    const totalSales = customerSales[0]?.totalSales || 0;

    const profit = totalSales - totalCost;

    res.status(200).json({
      purchased: totalPurchased,
      sold: totalSold,
      profit,
    });
  } catch (err) {
    console.error("Error generating inventory report:", err);
    res.status(500).json({ message: "Failed to generate inventory report" });
  }
};

exports.getStockLevels = async (req, res) => {
  try {
    const stockLevels = await Inventory.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "purchasedInventoryId",
          as: "sales",
        },
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "supplierId",
          foreignField: "_id",
          as: "supplier",
        },
      },
      {
        $unwind: {
          path: "$supplier",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          totalPurchased: {
            $cond: {
              if: { $gt: [{ $size: "$sales" }, 0] },
              then: { $sum: "$sales.quantityPurchased" },
              else: 0,
            },
          },
          currentStock: {
            $cond: {
              if: { $gt: [{ $size: "$sales" }, 0] },
              then: {
                $subtract: ["$quantity", { $sum: "$sales.quantityPurchased" }],
              },
              else: "$quantity",
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          brand: 1,
          quantity: 1,
          salePricePerUnit: 1,
          totalPurchased: 1,
          currentStock: 1,
          supplier: {
            name: 1,
            phone: 1,
            email: 1,
            company: 1,
          },
        },
      },
    ]);

    res.status(200).json({ success: true, data: stockLevels });
  } catch (err) {
    console.error("Error getting stock levels:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching stock levels",
      stack: err.stack,
    });
  }
};
