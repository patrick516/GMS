import { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { Box, Typography, Button, TextField, MenuItem } from "@mui/material";
import Chart from "chart.js/auto";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// import { saveAs } from "file-saver";

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
      ] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/inventory/report`),
        axios.get(`${import.meta.env.VITE_API_URL}/invoices/summary`),
        axios.get(`${import.meta.env.VITE_API_URL}/quotations/summary`),
        axios.get(`${import.meta.env.VITE_API_URL}/payslips/monthly`),
        axios.get(`${import.meta.env.VITE_API_URL}/customers/summary`),
        axios.get(`${import.meta.env.VITE_API_URL}/reports/summary`),
        axios.get(`${import.meta.env.VITE_API_URL}/payslips/trend`),
        axios.get(`${import.meta.env.VITE_API_URL}/payslips/all`),
      ]);

      const inventory = inventoryRes.data;
      const invoices = invoicesRes.data;
      const quotations = quotationsRes.data;
      const payroll = payrollRes.data;
      const customers = customersRes.data;
      const overallReport = overallReportRes.data;
      const payrollTrend = payrollTrendRes.data;

      const payslips = payslipsAllRes.data.data;

      autoTable(doc, {
        startY: 50,
        head: [["Section", "Details"]],
        body: [
          [
            "Inventory Summary",
            `Purchased: ${inventory.purchased}, Sold: ${inventory.sold}, Profit: ${inventory.profit} MWK`,
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
            `New: ${customers.newCustomers}, Top Spender: ${customers.topSpender}`,
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

      // Bar chart
      if (barChartRef.current) {
        const canvas = barChartRef.current;

        //  1. Destroy old chart if any
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
          existingChart.destroy();
        }

        //  2. Create chart
        new Chart(canvas, {
          type: "bar",
          data: {
            labels: payrollTrend.data.map((m: any) => m.label),
            datasets: [
              {
                label: "Monthly Net Pay (MWK)",
                data: payrollTrend.data.map((m: any) => m.netPay),
                backgroundColor: "#42a5f5",
              },
            ],
          },
          options: {
            responsive: false,
            animation: false,
            plugins: {
              title: {
                display: true,
                text: "Payroll Trend",
              },
              legend: {
                display: true,
                position: "bottom",
              },
            },
          },
        });

        // 3. Wait for rendering
        await new Promise((resolve) => setTimeout(resolve, 500));

        //  4. Convert canvas to image
        const canvasImage = await html2canvas(canvas, {
          willReadFrequently: true,
        } as any).then((c) => c.toDataURL("image/png"));

        //  5. Validate image before adding
        if (canvasImage && canvasImage !== "data:,") {
          const chartY = (doc as any).lastAutoTable?.finalY + 20 || 120;
          doc.addImage(canvasImage, "PNG", 10, chartY, 180, 90);
        } else {
          console.warn(" Chart image is invalid or empty — skipping.");
        }
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

      const remarkY = (doc as any).lastAutoTable?.finalY + 15 || 150;

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
      const [inventory, invoices, quotations, payroll, customers] =
        await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/inventory/report`),
          axios.get(`${import.meta.env.VITE_API_URL}/invoices/summary`),
          axios.get(`${import.meta.env.VITE_API_URL}/quotations/summary`),
          axios.get(`${import.meta.env.VITE_API_URL}/payslips/monthly`),
          axios.get(`${import.meta.env.VITE_API_URL}/customers/summary`),
        ]);

      const data = [
        {
          Section: "Inventory",
          Purchased: inventory.data.purchased,
          Sold: inventory.data.sold,
          Profit: inventory.data.profit,
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
        width={300}
        height={300}
        style={{ display: "none" }}
      />
    </Box>
  );
};

export default Reports;
