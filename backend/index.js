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

app.use("/api/inventory", inventoryRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/debtors", debtorRoutes);
app.use("/api/reorder", reorderRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/payslips", payslipRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/notify", notifyRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
