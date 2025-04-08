import { useParams } from "react-router-dom";
import { Box, Typography, Divider } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect } from "react";
import { useRef } from "react";

// TODO: Replace this with real invoice fetching logic
const mockInvoices = [
  {
    id: 1,
    customerName: "John Banda",
    phone: "0999123456",
    email: "john@example.com",
    plateNumber: "BZ 1234",
    model: "Toyota Hilux",
    problemDescription: "Brake pad replacement and oil change",
    serviceCost: 85000,
  },
  {
    id: 2,
    customerName: "Jane Phiri",
    phone: "0888123456",
    email: "jane@example.com",
    plateNumber: "KK 9876",
    model: "Mazda BT-50",
    problemDescription: "Full engine diagnostics",
    serviceCost: 120000,
  },
];

const Invoice = () => {
  const { id } = useParams();
  const invoice = mockInvoices.find((inv) => inv.id === Number(id));
  const hasDownloaded = useRef(false);

  useEffect(() => {
    if (invoice && !hasDownloaded.current) {
      const doc = new jsPDF();
      const logo = new Image();
      logo.src = "/logos/uas-motors-logo.png";

      logo.onload = () => {
        doc.addImage(logo, "PNG", 10, 10, 30, 30);
        doc.setFontSize(16);
        doc.text("Garage System - Invoice", 50, 25);

        autoTable(doc, {
          startY: 50,
          head: [["Field", "Details"]],
          body: [
            ["Invoice ID", invoice.id],
            ["Customer", invoice.customerName],
            ["Phone", invoice.phone],
            ["Email", invoice.email],
            ["Plate Number", invoice.plateNumber],
            ["Model", invoice.model],
            ["Service Description", invoice.problemDescription],
            ["Total", `${invoice.serviceCost} MWK`],
          ],
          styles: { fontSize: 10 },
          headStyles: { fillColor: [22, 160, 133] },
        });

        doc.text(
          "Thank you for trusting UAS Motors!",
          14,
          doc.lastAutoTable.finalY + 20
        );
        doc.save(`invoice_${invoice.id}.pdf`);

        hasDownloaded.current = true;
      };
    }
  }, [invoice]);

  if (!invoice) {
    return (
      <Typography className="text-center text-red-600">
        Invoice not found
      </Typography>
    );
  }

  return (
    <Box className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-10 text-black">
      <Typography variant="h4" className="font-bold mb-4 text-center">
        Invoice #{invoice.id}
      </Typography>

      <Divider className="mb-4" />

      <Typography>
        <strong>Customer:</strong> {invoice.customerName}
      </Typography>
      <Typography>
        <strong>Phone:</strong> {invoice.phone}
      </Typography>
      <Typography>
        <strong>Email:</strong> {invoice.email}
      </Typography>
      <Typography>
        <strong>Vehicle:</strong> {invoice.model} ({invoice.plateNumber})
      </Typography>
      <Typography className="my-4">
        <strong>Problem:</strong> {invoice.problemDescription}
      </Typography>
      <Typography variant="h6" className="font-semibold">
        Total Due: {invoice.serviceCost.toLocaleString()} MWK
      </Typography>

      <Divider className="my-4" />

      <Typography className="italic text-gray-600 text-sm">
        Thank you for choosing UAS Motors. We appreciate your business.
      </Typography>
    </Box>
  );
};

export default Invoice;
