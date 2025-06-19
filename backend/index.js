require("dotenv").config();

const connectDB = require("./db");
const express = require("express");
const cors = require("cors");
const path = require("path");

const uploadRoutes = require("./routes/upload.route");
const inventoryRoutes = require("./routes/inventory.route");
const supplierRoutes = require("./routes/supplier");
const customerRoutes = require("./routes/customer");
const debtorRoutes = require("./routes/debtor");
const reorderRoutes = require("./routes/reorder");
const employeeRoutes = require("./routes/employee");
const payslipRoutes = require("./routes/payslip");
const vehicleRoutes = require("./routes/vehicle");
const reportRoutes = require("./routes/report");
const invoiceRoutes = require("./routes/invoice");
const quotationRoutes = require("./routes/quotation");
const authRoutes = require("./routes/authRoute");
const auditRoutes = require("./routes/audit");
const notifyRoutes = require("./routes/notify");

const app = express();
app.use(cors());
app.use(express.json());

const verifyToken = require("./middleware/verifyToken");

// Basic test route
app.get("/", (req, res) => {
  res.send("GMS backend is live.");
});

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes (no /api prefix)
app.use("/inventory", inventoryRoutes);
app.use("/supplier", supplierRoutes);
app.use("/customers", customerRoutes);
app.use("/debtors", debtorRoutes);
app.use("/reorder", reorderRoutes);
app.use("/employees", employeeRoutes);
app.use("/payslips", payslipRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/reports", reportRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/upload", uploadRoutes);
app.use("/quotations", quotationRoutes);
app.use("/auth", authRoutes);
app.use("/audit", auditRoutes);
app.use("/notify", notifyRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
