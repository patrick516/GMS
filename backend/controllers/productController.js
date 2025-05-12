const mongoose = require("mongoose");
const Inventory = require("../models/Inventory");
const logAudit = require("../utils/logAudit");

exports.addInventory = async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.supplierId && mongoose.Types.ObjectId.isValid(body.supplierId)) {
      body.supplierId = new mongoose.Types.ObjectId(body.supplierId);
    }

    console.log(" Incoming Inventory:", body);

    const newItem = new Inventory(body);
    await newItem.save();

    // Here you are logging the inventory addition.
    await logAudit(req.user, "Added Inventory", {
      name: newItem.name,
      brand: newItem.brand,
      quantity: newItem.quantity,
    });

    res.status(201).json({ message: "Inventory added", item: newItem });
  } catch (error) {
    console.error("Error saving inventory:", error.message);
    res.status(500).json({ message: "Failed to save inventory", error });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Error fetching inventory", error });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await Inventory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "Inventory updated", item: updatedItem });
  } catch (err) {
    console.error("Error updating inventory:", err.message);
    res.status(500).json({ message: "Failed to update item", error: err });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    await Inventory.findByIdAndDelete(id);
    res.status(200).json({ message: "Inventory item deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete item", error });
  }
};
