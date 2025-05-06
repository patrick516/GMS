import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import Chart from "chart.js/auto";

export async function renderPayrollChart(
  doc: jsPDF,
  canvas: HTMLCanvasElement,
  payrollTrend: any
) {
  console.log(" Payroll trend data:", payrollTrend);
  const totalBars = payrollTrend.data.filter((m: any) => m.netPay > 0);

  if (totalBars.length === 0) {
    const lastY = (doc as any).lastAutoTable?.finalY || 120;
    console.log(
      "No bars to show. Rendering empty chart message at Y:",
      lastY + 15
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(
      "No payroll activity recorded in the last 6 months.",
      14,
      lastY + 15
    );
    // Reserve space to prevent overlap with the next section
    (doc as any).lastAutoTable = { finalY: lastY + 30 };
    return;
  }

  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: payrollTrend.data.map((m: any) => m.label),
      datasets: [
        {
          label: "Net Pay (MWK)",
          data: payrollTrend.data.map((m: any) => m.netPay),
          backgroundColor: "#42a5f5",
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: { display: true, text: "Net Payroll Trend" },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value} MWK`,
          },
        },
      },
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  const chartImage = await html2canvas(canvas, {
    willReadFrequently: true,
  } as any).then((c) => c.toDataURL("image/png"));
  console.log("Chart image:", chartImage?.substring(0, 30));

  if (chartImage && chartImage !== "data:,") {
    const lastY = (doc as any).lastAutoTable?.finalY || 100;
    console.log("Rendering payroll chart at Y:", lastY + 20);
    doc.addImage(chartImage, "PNG", 10, lastY + 20, 180, 90);
  } else {
    console.warn("Failed to capture payroll chart image.");
  }
}

export async function renderTopSpendersChart(
  doc: jsPDF,
  canvas: HTMLCanvasElement,
  topSpenders: any[]
) {
  if (!canvas) {
    console.warn("Canvas not found for Pie Chart!");
    return;
  }

  console.log("Canvas is ready:", canvas);
  console.log("Rendering Top 5 Spend Pie Chart:", topSpenders);

  const existingChart = Chart.getChart(canvas);
  if (existingChart) existingChart.destroy();

  new Chart(canvas, {
    type: "pie",
    data: {
      labels: topSpenders.map((c) => c._id),
      datasets: [
        {
          label: "Spending (MWK)",
          data: topSpenders.map((c) => c.totalSpent),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Top 5 Customer Spenders",
        },
      },
      responsive: false,
      animation: false, // Important to skip animation
    },
  });

  // WAIT for chart to render
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // DIRECTLY get image from canvas
  const chartImage = canvas.toDataURL("image/png");

  console.log("Pie chart image:", chartImage?.substring(0, 30));

  if (chartImage && chartImage !== "data:,") {
    const lastY = (doc as any).lastAutoTable?.finalY || 100;

    //  Ensure chart fits on current page
    const pageHeight = doc.internal.pageSize.height;
    const chartHeight = 90;
    const chartY = lastY + 20;

    if (chartY + chartHeight > pageHeight) {
      doc.addPage();
      doc.setFontSize(12);
      doc.text("Top 5 Customer Spend (continued)", 14, 20);
      doc.addImage(chartImage, "PNG", 10, 30, 180, chartHeight);
      (doc as any).lastAutoTable = { finalY: 130 };
    } else {
      doc.addImage(chartImage, "PNG", 10, chartY, 180, chartHeight);
      (doc as any).lastAutoTable = { finalY: chartY + chartHeight };
    }
  } else {
    console.warn("Pie chart image is empty. Skipping chart rendering.");
  }
}

export const renderInvoiceTable = (doc: jsPDF, topInvoices: any[]) => {
  const lastY = (doc as any).lastAutoTable?.finalY;
  const titleY = typeof lastY === "number" ? lastY + 30 : 150;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Invoice Breakdown (Top 5 Customers)", 14, titleY);

  doc.setFontSize(11);
  doc.text("Top 5 Invoices by Service Cost", 14, titleY + 8);

  autoTable(doc, {
    startY: titleY + 14,
    head: [["Customer", "Amount", "Status"]],
    body: topInvoices.map((inv: any) => [
      inv.customerName,
      `MWK ${inv.serviceCost.toLocaleString("en-MW")}`,
      inv.paymentStatus || "—",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [255, 193, 7] },
  });
};

export const renderQuotationTable = (doc: jsPDF, quotations: any[]) => {
  console.log(" Quotations received:", quotations);

  const top5 = [...quotations]
    .filter((q) => q.serviceCost > 0)
    .sort((a, b) => b.serviceCost - a.serviceCost)
    .slice(0, 5);

  const lastY = (doc as any).lastAutoTable?.finalY;
  const titleY = typeof lastY === "number" ? lastY + 30 : 150;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Quotation Breakdown (Top 5 Customers)", 14, titleY);

  doc.setFontSize(11);
  doc.text("Top 5 Quotations by Value", 14, titleY + 8);

  autoTable(doc, {
    startY: titleY + 14,
    head: [["Customer", "Amount", "Date"]],
    body: top5.map((q: any) => [
      q.customerName || "—",
      `MWK ${q.serviceCost.toLocaleString("en-MW")}`,
      new Date(q.createdAt).toLocaleDateString("en-MW"),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 188, 212] },
  });
};

export const renderCustomerTable = (doc: jsPDF, frequentCustomers: any[]) => {
  const lastY = (doc as any).lastAutoTable?.finalY || 150;
  const titleY = lastY + 30;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Top Customers by Visit Frequency", 14, titleY);

  // Table
  autoTable(doc, {
    startY: titleY + 8,
    head: [["Customer", "Visits", "Total Spent"]],
    body: frequentCustomers.map((cust: any) => [
      cust._id,
      `${cust.visits} visit(s)`,
      `MWK ${cust.totalSpent.toLocaleString("en-MW")}`,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 172, 193] },
  });

  // Insight
  const mostFrequent = frequentCustomers[0];
  const finalY = (doc as any).lastAutoTable?.finalY || titleY + 50;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(66, 66, 66);
  doc.text(
    `${mostFrequent._id} was the most frequent customer with ${
      mostFrequent.visits
    } visit(s) and MWK ${mostFrequent.totalSpent.toLocaleString(
      "en-MW"
    )} spent.`,
    14,
    finalY + 15
  );

  // Reserve space
  (doc as any).lastAutoTable = { finalY: finalY + 30 };
};
export const renderAllCustomerSummary = (doc: jsPDF, allCustomers: any[]) => {
  const totalCustomers = allCustomers.length;

  const topCustomer = [...allCustomers].reduce(
    (top: any, customer: any) =>
      customer.payment > (top?.payment || 0) ? customer : top,
    allCustomers[0]
  );

  const name = topCustomer?.name || "—";
  const amount = topCustomer?.payment || 0;

  const lastY = (doc as any).lastAutoTable?.finalY || 120;
  const summaryY = lastY + 15;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(
    `There are ${totalCustomers} customers in the system. Top spender is ${name} with MWK ${amount.toLocaleString(
      "en-MW"
    )} spent.`,
    14,
    summaryY
  );

  (doc as any).lastAutoTable = { finalY: summaryY + 15 };
};
export const renderAllCustomersTable = (doc: jsPDF, customers: any[]) => {
  const lastY = (doc as any).lastAutoTable?.finalY || 150;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Total Customers for the Month", 14, lastY + 15);

  autoTable(doc, {
    startY: lastY + 20,
    head: [["Name", "Phone", "Email", "Amount Paid (MWK)", "Balance (MWK)"]],
    body: customers.map((c: any) => [
      c.name || "—",
      c.phone || "—",
      c.email || "—",
      c.payment?.toLocaleString("en-MW") || "0",
      c.balance?.toLocaleString("en-MW") || "0",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [100, 100, 255] },
  });
};
