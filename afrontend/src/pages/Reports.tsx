import { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Box, Typography, Button, TextField, MenuItem } from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  renderPayrollChart,
  renderTopSpendersChart,
  renderInvoiceTable,
  renderQuotationTable,
  renderCustomerTable,
  renderAllCustomerSummary,
  renderAllCustomersTable,
} from "@utils/ReportHelpers";

import {
  fetchInventoryReport,
  fetchInvoicesSummary,
  fetchAllInvoices,
  fetchQuotationsSummary,
  fetchPayrollMonthly,
  fetchCustomersSummary,
  fetchOverallReport,
  fetchPayrollTrend,
  fetchAllPayslips,
  fetchAllQuotations,
  fetchFrequentCustomers,
  fetchAllCustomers,
  fetchDebtors,
} from "@services/ReportsService";

type InventoryItem = {
  name: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  purchaseValue: number;
  saleValue: number;
  profit: number;
};

type Report = {
  id: number;
  name: string;
  createdAt: string;
};

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const pieChartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const settings = JSON.parse(
      localStorage.getItem("garage-settings") || "{}"
    );
    const autoReport = settings.autoReport !== false;

    if (!autoReport) {
      console.log("Auto-report generation is turned OFF by user.");
      return;
    }

    const now = new Date();
    const currentMonth = now.toLocaleString("default", { month: "long" });
    const currentYear = now.getFullYear();
    const reportName = `Report for ${currentMonth} ${currentYear}`;

    //  Load previous reports from localStorage
    const existingReports = JSON.parse(
      localStorage.getItem("garage-reports") || "[]"
    );

    //  Reset/remove reports older than 30 days
    const filteredReports = existingReports.filter((report: Report) => {
      const createdAt = new Date(report.createdAt);
      const daysOld =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysOld <= 30;
    });

    localStorage.setItem("garage-reports", JSON.stringify(filteredReports));

    //  Check if current month already exists
    const alreadyExists = filteredReports.find(
      (r: any) => r.name === reportName
    );
    if (!alreadyExists) {
      const newReport = {
        id: Date.now(),
        name: reportName,
        createdAt: now.toISOString(),
      };
      filteredReports.push(newReport);
      localStorage.setItem("garage-reports", JSON.stringify(filteredReports));
    }

    //   Finally update UI state
    setReports(filteredReports);
  }, []);

  const handleDownload = (report: Report) => {
    const doc = new jsPDF();
    const logo = new Image();

    //  Use .webp logo instead of .png
    logo.src = "/logos/uas-motors-logo.webp";

    //  If logo loads, draw it and continue PDF generation
    logo.onload = () => {
      doc.addImage(logo, "WEBP", 10, 10, 30, 30);
      doc.setFontSize(16);
      doc.text(report.name, 50, 25);
      continuePDF(doc, report);
    };

    // If logo fails to load, still generate the rest of the PDF
    logo.onerror = () => {
      console.warn(" Logo failed to load — continuing without it.");
      doc.setFontSize(16);
      doc.text(report.name, 50, 25);
      continuePDF(doc, report);
    };
  };
  const continuePDF = async (doc: jsPDF, report: Report) => {
    try {
      const [
        inventoryRes,
        invoicesRes,
        quotationsRes,
        payrollRes,
        customersRes,
        overallReportRes,
        payrollTrendRes,
        payslipsAllRes,
        topInvoicesRes,
        allQuotationsRes,
        frequentCustomersRes,
        allCustomersRes,
        debtorsRes,
      ] = await Promise.all([
        fetchInventoryReport(),
        fetchInvoicesSummary(),
        fetchQuotationsSummary(),
        fetchPayrollMonthly(),
        fetchCustomersSummary(),
        fetchOverallReport(),
        fetchPayrollTrend(),
        fetchAllPayslips(),
        fetchAllInvoices(),
        fetchAllQuotations(),
        fetchFrequentCustomers(),
        fetchAllCustomers(),
        fetchDebtors(),
      ]);

      const debtors = debtorsRes.data.data;

      const totalDebtors = debtors.length;
      const totalAmountOwed = debtors.reduce(
        (sum: number, cust: any) => sum + (cust.balance || 0),
        0
      );

      const detailedInventory = inventoryRes.data.data;
      const invoices = invoicesRes.data;
      const quotations = quotationsRes.data;
      const overallReport = overallReportRes.data.data;
      const payroll = payrollRes.data.data;
      const payrollTrend = payrollTrendRes.data;
      const payslips = payslipsAllRes.data.data;
      const allCustomers = allCustomersRes.data.data;
      const totalCustomers = allCustomers.length;
      const topCustomer = allCustomers.reduce(
        (top: any, customer: any) =>
          customer.payment > (top?.payment || 0) ? customer : top,
        allCustomers[0]
      );

      const topSpenderName = topCustomer?.name || "—";
      const topSpenderAmount = topCustomer?.payment || 0;

      autoTable(doc, {
        startY: 50,
        head: [["Section", "Details"]],
        body: [
          [
            "Inventory Summary",
            `Items: ${
              detailedInventory.length
            }, Total Revenue: MWK ${detailedInventory
              .reduce((sum: number, i: any) => sum + (i.revenue || 0), 0)
              .toLocaleString()}, Profit: MWK ${detailedInventory
              .reduce((sum: number, i: any) => sum + (i.profit || 0), 0)
              .toLocaleString()}`,
          ],
          [
            "Invoice Summary",
            `Total: ${invoices.total}, Paid: ${invoices.paid}, Unpaid: ${invoices.unpaid}`,
          ],
          [
            "Quotation Overview",
            `Sent: ${quotations.total}, Value: ${quotations.value} MWK`,
          ],
          [
            "Payroll Summary",
            `Gross: ${payroll.gross}, Deductions: ${payroll.deductions}, Net: ${payroll.net}`,
          ],
          [
            "Customer Overview",
            `Total: ${totalCustomers}, Top Spender: ${topSpenderName} (MWK ${topSpenderAmount.toLocaleString(
              "en-MW"
            )})`,
          ],

          [
            "Debtors Summary",
            `Customers Owing: ${totalDebtors}, Total Outstanding: MWK ${totalAmountOwed.toLocaleString(
              "en-MW"
            )}`,
          ],

          [
            "Quotation vs Invoice Summary",
            `Quotations: ${overallReport.totalQuotations} (${overallReport.totalQuotationAmount} MWK), Invoices: ${overallReport.totalInvoices} (${overallReport.totalInvoiceAmount} MWK), Difference: ${overallReport.difference} MWK`,
          ],
          [
            "Payroll Summary",
            `Paid: ${payroll.count} employees, Gross: ${payroll.gross} MWK, Tax: ${payroll.tax}, Deductions: ${payroll.otherDeductions}, Allowances: ${payroll.allowances}, Net Pay: ${payroll.net}`,
          ],
        ],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
      });

      if (Array.isArray(detailedInventory) && detailedInventory.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(33, 33, 33);
        doc.text(
          "Inventory Breakdown",
          14,
          (doc as any).lastAutoTable?.finalY + 15 || 120
        );

        autoTable(doc, {
          startY: (doc as any).lastAutoTable?.finalY + 20 || 130,
          head: [
            [
              "Item",
              "Brand",
              "Purchased",
              "Sold",
              "In Stock",
              "Revenue",
              "Cost",
              "Profit",
            ],
          ],
          body: detailedInventory.map((item) => [
            item.name,
            item.brand || "—",
            item.totalPurchased,
            item.totalSold,
            item.currentStock,
            item.revenue.toLocaleString("en-MW"),
            item.cost.toLocaleString("en-MW"),
            item.profit.toLocaleString("en-MW"),
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [22, 160, 133] },
        });

        const mostStocked = detailedInventory.reduce(
          (top, item) =>
            item.totalPurchased > top.totalPurchased ? item : top,
          detailedInventory[0]
        );

        const lastY = (doc as any).lastAutoTable?.finalY;
        const insightY = typeof lastY === "number" ? lastY + 30 : 150;

        //  Style the text
        doc.setFont("helvetica", "italic");
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);

        //  Render insight message below last autoTable
        doc.text(
          `${mostStocked.name} was the most stocked item (${
            mostStocked.totalPurchased
          } units). It generated MWK ${mostStocked.revenue.toLocaleString(
            "en-MW"
          )} in revenue and had ${mostStocked.currentStock} still in stock.`,
          14,
          insightY
        );
      }

      // Bar chart
      if (barChartRef.current) {
        await renderPayrollChart(doc, barChartRef.current, payrollTrend);
      }

      if (Array.isArray(payslips) && payslips.length > 0) {
        doc.setFontSize(12);
        doc.text(
          "Employee Payroll Details",
          14,
          (doc as any).lastAutoTable?.finalY + 15 || 120
        );

        autoTable(doc, {
          startY: (doc as any).lastAutoTable?.finalY + 20 || 130,
          head: [
            ["Name", "Salary", "Tax", "Allowances", "Deductions", "Net Pay"],
          ],
          body: payslips.map((p: any) => [
            p.employeeId?.fullName || "—",
            p.salary?.toLocaleString() || "—",
            p.tax?.toLocaleString() || "—",
            p.allowances?.toLocaleString() || "—",
            p.otherDeductions?.toLocaleString() || "—",
            p.netPay?.toLocaleString() || "—",
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [92, 184, 92] },
        });
      }
      const totalNetPay = payslips.reduce(
        (sum: number, slip: any) => sum + (slip.netPay || 0),
        0
      );

      const now = new Date();
      const monthName = now.toLocaleString("default", { month: "long" });
      const year = now.getFullYear();

      const remarkY = (doc as any).lastAutoTable?.finalY + 10 || 150;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(33, 33, 33);
      doc.text(
        `A total of MWK ${totalNetPay.toLocaleString(
          "en-MW"
        )} was paid to UAS Motors employees as payroll expense for ${monthName} ${year}.`,
        14,
        remarkY
      );

      // 2. Then apply it to text rendering

      // Data Table
      const topInvoices = [...topInvoicesRes.data.data]
        .sort((a, b) => b.serviceCost - a.serviceCost)
        .slice(0, 5);

      renderInvoiceTable(doc, topInvoices);

      const allQuotations = allQuotationsRes.data.data;

      renderQuotationTable(doc, allQuotations);

      const frequentCustomers = frequentCustomersRes.data.data;

      const top5Spenders = [...frequentCustomers]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      renderCustomerTable(doc, frequentCustomers);

      if (pieChartRef.current) {
        await renderTopSpendersChart(doc, pieChartRef.current, top5Spenders);
      }

      renderAllCustomersTable(doc, allCustomers);

      renderAllCustomerSummary(doc, allCustomers);

      const footerY = (doc as any).lastAutoTable?.finalY + 80 || 50;

      const paddingY = 4;

      doc.setFillColor(230, 240, 255);
      doc.roundedRect(12, footerY - paddingY, 185, 10, 2, 2, "F");

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 150, 200);
      doc.text("Generated by UAS System", 14, footerY);

      doc.save(`${report.name.replaceAll(" ", "_")}.pdf`);
    } catch (err: any) {
      console.error("PDF generation failed:", err.message || err);
      alert(" PDF failed: " + (err.message || err));
    }
  };

  const exportSummaryToExcel = async () => {
    try {
      const [inventoryRes, invoices, quotations, payroll, customers] =
        await Promise.all([
          fetchInventoryReport(),
          fetchInvoicesSummary(),
          fetchQuotationsSummary(),
          fetchPayrollMonthly(),
          fetchCustomersSummary(),
        ]);

      const detailed = inventoryRes.data.data;

      const totalRevenue = detailed.reduce(
        (sum: number, item: any) => sum + (item.revenue || 0),
        0
      );
      const totalCost = detailed.reduce(
        (sum: number, item: any) => sum + (item.cost || 0),
        0
      );
      const totalProfit = detailed.reduce(
        (sum: number, item: any) => sum + (item.profit || 0),
        0
      );

      const data = [
        {
          Section: "Inventory",
          Revenue: totalRevenue,
          Cost: totalCost,
          Profit: totalProfit,
        },
        {
          Section: "Invoices",
          Total: invoices.data.total,
          Paid: invoices.data.paid,
          Unpaid: invoices.data.unpaid,
        },
        {
          Section: "Quotations",
          Sent: quotations.data.total,
          Value: quotations.data.value,
        },
        {
          Section: "Payroll",
          PaidEmployees: payroll.data.count,
          Gross: payroll.data.gross,
          Tax: payroll.data.tax,
          Allowances: payroll.data.allowances,
          Deductions: payroll.data.otherDeductions,
          Net: payroll.data.net,
        },
        {
          Section: "Customer",
          New: customers.data.newCustomers,
          TopSpender: customers.data.topSpender,
        },
      ];

      const sheet = XLSX.utils.json_to_sheet(data);
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, "Garage Report");

      const blob = new Blob(
        [XLSX.write(book, { bookType: "xlsx", type: "array" })],
        { type: "application/octet-stream" }
      );

      saveAs(
        blob,
        `Garage_Report_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Excel export failed:", error);
      alert("Something went wrong while exporting to Excel.");
    }
  };

  return (
    <Box className="max-w-5xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black">
      <Typography
        variant="h4"
        className="mb-6 font-bold text-center text-gray-800"
      >
        Monthly Reports
      </Typography>
      <Button
        variant="outlined"
        color="secondary"
        onClick={exportSummaryToExcel}
        sx={{ mb: 4 }}
      >
        Export Summary to Excel
      </Button>

      <TextField
        select
        label="Select Month to Generate"
        fullWidth
        sx={{ mb: 4 }}
        onChange={(e) => {
          const [month, year] = e.target.value.split(" ");
          const reportName = `Report for ${month} ${year}`;
          const newReport = {
            id: Date.now(),
            name: reportName,
            createdAt: new Date().toISOString(),
          };
          setReports((prev) => [...prev, newReport]);

          // Optionally save to localStorage if needed:
          const stored = JSON.parse(
            localStorage.getItem("garage-reports") || "[]"
          );
          stored.push(newReport);
          localStorage.setItem("garage-reports", JSON.stringify(stored));
        }}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const d = new Date();
          d.setMonth(i);
          const monthLabel = d.toLocaleString("default", { month: "long" });
          const year = new Date().getFullYear();
          return (
            <MenuItem key={i} value={`${monthLabel} ${year}`}>
              {monthLabel} {year}
            </MenuItem>
          );
        })}
      </TextField>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((report, index) => (
          <Box
            key={report.id}
            className="flex items-center justify-between border p-4 rounded-lg shadow-sm"
          >
            <Typography className="font-medium">
              {index + 1}. {report.name}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleDownload(report)}
            >
              Download
            </Button>
            <canvas
              ref={chartRef}
              width={300}
              height={300}
              style={{ display: "none" }}
            />
          </Box>
        ))}
      </div>
      <canvas
        ref={barChartRef}
        width={500}
        height={300}
        style={{ visibility: "hidden", position: "absolute", top: 0, left: 0 }}
      />
      <canvas
        ref={pieChartRef}
        width={500}
        height={300}
        style={{
          position: "absolute",
          top: "-1000px", // push it far off screen
          opacity: 0, // invisible but still rendered
          pointerEvents: "none",
        }}
      />

      <canvas
        ref={pieChartRef}
        width={300}
        height={300}
        style={{ display: "none" }}
      />
    </Box>
  );
};

export default Reports;
