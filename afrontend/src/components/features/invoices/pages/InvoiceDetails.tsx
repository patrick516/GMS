import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const Invoice = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // options: 'all', 'today', 'week'

  const hasDownloaded = useRef<boolean>(false);

  useEffect(() => {
    if (id && id !== "details") {
      const fetchInvoice = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/invoices/${id}`
          );
          if (!res.data.success || !res.data.data) {
            setError("Invoice not found.");
          } else {
            setInvoice(res.data.data);
          }
        } catch (err) {
          setError("Server error while fetching invoice.");
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    } else {
      const fetchAll = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/invoices/all`
          );
          setInvoices(res.data.data);
          console.log(
            "DataGrid rows",
            res.data.data.map((i: any) => ({
              _id: i._id,
              createdAt: i.createdAt,
              type: typeof i.createdAt,
              isValid: !isNaN(new Date(i.createdAt).getTime()),
            }))
          );

          const now = new Date();
          const filtered = res.data.data.filter((inv: any) => {
            if (!inv.createdAt) return false;

            const createdAt = new Date(inv.createdAt);

            if (dateFilter === "today") {
              return createdAt.toDateString() === now.toDateString();
            }

            if (dateFilter === "week") {
              const oneWeekAgo = new Date(now);
              oneWeekAgo.setDate(now.getDate() - 7);
              return createdAt >= oneWeekAgo;
            }

            return true; // if "all"
          });

          setInvoices(filtered);

          // ✅ Log the incoming data for verification
          console.log(
            "✅ DataGrid rows ➜",
            res.data.data.map((i: any) => ({
              _id: i._id,
              createdAt: i.createdAt,
              type: typeof i.createdAt,
              isValid: !isNaN(new Date(i.createdAt).getTime()),
            }))
          );
        } catch (err) {
          setError("Failed to fetch invoice list.");
        } finally {
          setLoading(false);
        }
      };
      fetchAll();
    }
  }, [id]);

  useEffect(() => {
    if (!loading && invoices.length > 0) {
      console.log("DEBUG >> invoice rows:", invoices);
      invoices.forEach((inv, index) => {
        console.log(`Invoice #${index + 1}:`, {
          _id: inv._id,
          createdAt: inv.createdAt,
          type: typeof inv.createdAt,
          isValidDate: !isNaN(new Date(inv.createdAt).getTime()),
        });
      });
    }
  }, [loading, invoices]);

  useEffect(() => {
    if (invoice && !hasDownloaded.current) {
      const doc = new jsPDF();
      const logo = new Image();
      logo.src = "/logos/uas-motors-logo.png";
      logo.onload = () => {
        selectedIds.forEach((id, index) => {
          const inv = invoices.find((i) => i._id === id);
          if (!inv) return;

          if (index > 0 && index % 2 === 0) doc.addPage();

          const yStart = 20 + (index % 2) * 130;

          doc.addImage(logo, "PNG", 10, yStart, 30, 30);
          doc.setFontSize(16);
          doc.setTextColor(22, 160, 133);
          doc.text("Garage System - Invoice", 50, yStart + 10);

          autoTable(doc, {
            startY: yStart + 30,
            head: [["Field", "Details"]],
            body: [
              ["Invoice ID", inv._id],
              ["Customer", inv.customerName],
              ["Phone", inv.phone],
              ["Email", inv.email],
              ["Plate Number", inv.plateNumber],
              ["Model", inv.model],
              ["Service Description", inv.problemDescription],
              ["Total", `${inv.serviceCost} MWK`],
              ["Payment Status", inv.paymentStatus || "Unpaid"],
              ["Invoice Date", new Date(inv.createdAt).toLocaleString()],
            ],
            styles: { fontSize: 10 },
            headStyles: { fillColor: [22, 160, 133] },
          });

          doc.text(
            "Thank you for trusting UAS Motors!",
            14,
            (doc as any).lastAutoTable.finalY + 10
          );
        });

        doc.save("invoices_selected.pdf");
      };
    }
  }, [invoice]);

  const exportSelected = () => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/logos/uas-motors-logo.png";

    logo.onload = () => {
      selectedIds.forEach((id, index) => {
        const inv = invoices.find((i) => i._id === id);
        if (!inv) return;
        if (index > 0 && index % 2 === 0) doc.addPage();

        const yStart = 20 + (index % 2) * 130;

        doc.addImage(logo, "PNG", 10, yStart, 30, 30);
        doc.setFontSize(14);
        doc.setTextColor(22, 160, 133);
        doc.text("UAS Motors - Invoice", 50, yStart + 10);

        autoTable(doc, {
          startY: yStart + 30,
          head: [["Field", "Details"]],
          body: [
            ["Invoice ID", inv._id],
            ["Customer", inv.customerName],
            ["Phone", inv.phone],
            ["Email", inv.email],
            ["Plate Number", inv.plateNumber],
            ["Model", inv.model],
            ["Service Description", inv.problemDescription],
            ["Total", `${inv.serviceCost} MWK`],
            ["Payment Status", inv.paymentStatus || "Unpaid"],
            ["Invoice Date", new Date(inv.createdAt).toLocaleString()],
          ],
          styles: { fontSize: 9 },
          headStyles: { fillColor: [22, 160, 133] },
        });

        doc.text(
          "Thank you for choosing UAS Motors!",
          14,
          (doc as any).lastAutoTable.finalY + 10
        );
      });

      doc.save("invoices_selected.pdf");
    };
  };

  const columns: GridColDef[] = [
    {
      field: "_id",
      headerName: "ID",
      width: 220,
    },
    {
      field: "customerName",
      headerName: "Customer",
      width: 150,
    },
    {
      field: "plateNumber",
      headerName: "Plate",
      width: 130,
    },
    {
      field: "serviceCost",
      headerName: "Amount",
      width: 120,
    },
    {
      field: "paymentStatus",
      headerName: "Status",
      width: 100,
    },
    {
      field: "createdAt",
      headerName: "Invoice Date",
      width: 180,
      renderCell: (params: any) => {
        const createdAt = params.row?.createdAt;
        if (!createdAt) return "N/A";
        const date = new Date(createdAt);
        return isNaN(date.getTime())
          ? "Invalid"
          : date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
      },
    },
  ];

  if (loading)
    return <Typography className="text-center">Loading...</Typography>;

  if (error)
    return (
      <Typography className="text-center text-red-600">{error}</Typography>
    );

  if (id && invoice && id !== "details") {
    return (
      <Box className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-10 text-black">
        <Typography variant="h4" className="font-bold mb-4 text-center">
          Invoice #{invoice._id}
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
        <Typography variant="h6">
          <strong>Total:</strong> {invoice.serviceCost.toLocaleString()} MWK
        </Typography>
        <Typography>
          <strong>Status:</strong> {invoice.paymentStatus}
        </Typography>
        <Typography>
          <strong>Date:</strong>{" "}
          {new Date(invoice.createdAt).toLocaleDateString()}
        </Typography>
        <Divider className="my-4" />
        <Typography className="italic text-gray-600 text-sm">
          Thank you for choosing UAS Motors. We appreciate your business.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => window.history.back()}
          style={{ marginTop: "20px" }}
        >
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl text-black">
      <Typography
        variant="h4"
        className="mb-4 text-center font-bold text-gray-800"
      >
        All Invoices
      </Typography>
      <Button
        variant="outlined"
        color="secondary"
        disabled={selectedIds.length === 0}
        onClick={exportSelected}
        className="mb-4"
      >
        Export Selected
      </Button>

      <Box className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <TextField
          label="Search by Customer or Plate"
          variant="outlined"
          size="small"
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
        <TextField
          select
          label="Filter by Date"
          value={dateFilter}
          size="small"
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="week">This Week</MenuItem>
        </TextField>
      </Box>

      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          checkboxSelection
          onRowSelectionModelChange={(ids) => setSelectedIds(ids as string[])}
          rowSelectionModel={selectedIds}
          rows={invoices
            .filter(
              (i) =>
                i.customerName.toLowerCase().includes(searchTerm) ||
                i.plateNumber.toLowerCase().includes(searchTerm)
            )
            .map((i) => ({
              id: i._id,
              _id: i._id,
              customerName: i.customerName,
              plateNumber: i.plateNumber,
              serviceCost: i.serviceCost,
              paymentStatus: i.paymentStatus,
              createdAt: i.createdAt,
            }))}
          columns={columns}
          pageSizeOptions={[5]}
          paginationModel={{ pageSize: 5, page: currentPage }}
          onPaginationModelChange={(model) => setCurrentPage(model.page)}
          getRowClassName={(params) =>
            params.row.paymentStatus?.toLowerCase() === "unpaid"
              ? "row-unpaid"
              : "row-paid"
          }
        />
      </div>
    </Box>
  );
};

export default Invoice;
