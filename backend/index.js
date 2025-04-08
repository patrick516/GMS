const connectDB = require("./db");

const express = require("express");
const cors = require("cors");
const path = require("path");
const uploadRoutes = require("./routes/upload.route");
const inventoryRoutes = require("./routes/inventory.route");
const supplierRoutes = require("./routes/supplier");
const customerRoutes = require("./routes/customer");
const debtorRoutes = require("./routes/debtor");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/inventory", inventoryRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/debtors", require("./routes/debtor"));
app.use("/api/inventory", require("./routes/inventory"));

app.use("/api/upload", uploadRoutes);
connectDB();

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
