const Inventory = require("../models/Inventory"); // make sure this points to 'inventories'
const Customer = require("../models/Customer");

exports.getStockLevels = async (req, res) => {
  try {
    const stockLevels = await Inventory.aggregate([
      {
        $lookup: {
          from: "customers", // MUST match collection name
          localField: "_id",
          foreignField: "purchasedInventoryId",
          as: "sales",
        },
      },
      {
        $addFields: {
          totalPurchased: { $sum: "$sales.quantityPurchased" },
          currentStock: {
            $subtract: ["$quantity", { $sum: "$sales.quantityPurchased" }],
          },
        },
      },
      {
        $project: {
          name: 1,
          brand: 1,
          quantity: 1,
          totalPurchased: 1,
          currentStock: 1,
          salePricePerUnit: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: stockLevels });
  } catch (err) {
    console.error("Error getting stock levels:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching stock levels" });
  }
};
