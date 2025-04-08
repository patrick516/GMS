const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");

// @route   POST /api/inventory/add
// @desc    Add new inventory item
router.post("/add", async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();

    res.status(201).json({ message: "Inventory added", item: newItem });
  } catch (error) {
    console.error("Error saving inventory:", error.message);
    res.status(500).json({ message: "Failed to save inventory", error });
  }
});
router.get("/", async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Error fetching inventory", error });
  }
});
// UPDATE inventory item by ID
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await Inventory.findByIdAndUpdate(id, req.body, {
      new: true, // return updated item
    });
    res.status(200).json({ message: "Inventory updated", item: updatedItem });
  } catch (err) {
    console.error("Error updating inventory:", err.message);
    res.status(500).json({ message: "Failed to update item", error: err });
  }
});

//delete the inventory

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Inventory.findByIdAndDelete(id);
    res.status(200).json({ message: "Inventory item deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete item", error });
  }
});

module.exports = router;
