import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const schema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  phone: z.string().optional(),
  email: z.string().optional(),
  model: z.string().optional(),
  problemDescription: z.string().min(5, "Description is required"),
  serviceCost: z.coerce.number().min(1, "Service cost required"),
});

const CreateQuotation = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<
    { name: string; phone?: string; email?: string }[]
  >([]);
  const [vehicles, setVehicles] = useState<
    { id: string; plate: string; model: string; owner: string }[]
  >([]);

  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<{
    id: string;
    plate: string;
    model: string;
    owner: string;
  } | null>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: "",
      vehicleId: "",
      phone: "",
      email: "",
      model: "",
      problemDescription: "",
      serviceCost: 0,
    },
  });

  useEffect(() => {
    setCustomers([
      { name: "John Banda", phone: "0999123456", email: "john@example.com" },
      { name: "Jane Phiri", phone: "0888123456", email: "jane@example.com" },
    ]);
    setVehicles([
      { id: "1", plate: "BZ 1234", model: "Toyota Hilux", owner: "John Banda" },
      { id: "2", plate: "KK 9876", model: "Mazda BT-50", owner: "Jane Phiri" },
    ]);
  }, []);

  const filteredVehicles = vehicles.filter((v) => v.owner === selectedCustomer);

  const onSubmit = (data: any) => {
    const vehicle = vehicles.find((v) => v.id === data.vehicleId);
    if (vehicle && vehicle.owner !== data.customerName) {
      toast.error("Selected vehicle does not belong to the selected customer");
      return;
    }

    const newQuote = {
      id: quotations.length + 1,
      ...data,
      plateNumber: vehicle?.plate,
      model: vehicle?.model,
      status: "pending",
      paymentStatus: "Unpaid", // for invoice tracking
      createdAt: new Date().toISOString(), // for filtering later
    };

    setQuotations((prev) => [...prev, newQuote]);

    // ✅ Placeholder for backend email/WhatsApp logic

    // Data: phone: data.phone, email: data.email, customerName: data.customerName
    console.log(`Send WhatsApp/Email to ${data.phone || data.email}`);
    toast.info("Customer has been notified");

    generatePDF(newQuote);
    toast.success("Quotation created");

    reset();
    setSelectedCustomer("");
    setSelectedVehicle(null);
  };

  const generatePDF = (quote: any) => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/logos/uas-motors-logo.png";
    logo.onload = () => {
      doc.addImage(logo, "PNG", 10, 10, 30, 30);
      doc.setFontSize(16);
      doc.text("Garage System", 45, 25);

      autoTable(doc, {
        startY: 50,
        head: [["Field", "Value"]],
        body: [
          ["Quotation ID", quote.id],
          ["Customer", quote.customerName],
          ["Phone", quote.phone || "-"],
          ["Email", quote.email || "-"],
          ["Plate Number", quote.plateNumber || "-"],
          ["Vehicle Model", quote.model || "-"],
          ["Problem", quote.problemDescription],
          ["Service Cost", `${quote.serviceCost} MWK`],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [22, 160, 133] },
      });
      doc.save(`quotation_${quote.id}.pdf`);
    };
  };

  const handleMarkAsInvoiced = (id: number) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "invoiced" } : q))
    );
  };

  const handleViewInvoice = (id: number) => {
    navigate(`/invoices/${id}`);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "customerName", headerName: "Customer", flex: 1 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "plateNumber", headerName: "Plate No.", width: 130 },
    { field: "model", headerName: "Model", width: 140 },
    { field: "problemDescription", headerName: "Problem", flex: 1 },
    { field: "serviceCost", headerName: "Service Cost (MWK)", width: 160 },

    {
      field: "action",
      headerName: "Action",
      width: 160,
      renderCell: (params) => {
        const row = params.row;
        return row.status === "invoiced" ? (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleViewInvoice(row.id)}
          >
            View Invoice
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="success"
            onClick={() => handleMarkAsInvoiced(row.id)}
          >
            Done
          </Button>
        );
      },
    },
  ];

  return (
    <Box className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black">
      <Typography
        variant="h4"
        className="text-center mb-6 font-bold text-gray-800"
      >
        Create Quotation
      </Typography>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Autocomplete
          freeSolo
          options={customers.map((c) => c.name)}
          value={selectedCustomer}
          onInputChange={(_, value) => {
            setSelectedCustomer(value);
            setValue("customerName", value);
            const customer = customers.find((c) => c.name === value);
            setValue("phone", customer?.phone || "");
            setValue("email", customer?.email || "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Customer Name"
              error={!!errors.customerName}
              helperText={errors.customerName?.message}
              fullWidth
            />
          )}
        />

        <TextField
          select
          label="Vehicle (Plate)"
          {...register("vehicleId")}
          error={!!errors.vehicleId}
          helperText={errors.vehicleId?.message}
          fullWidth
          onChange={(e) => {
            const vehicle = vehicles.find((v) => v.id === e.target.value);
            setValue("vehicleId", e.target.value);
            setSelectedVehicle(vehicle || null);
            if (vehicle) {
              setSelectedCustomer(vehicle.owner);
              setValue("customerName", vehicle.owner);
              const customer = customers.find((c) => c.name === vehicle.owner);
              setValue("phone", customer?.phone || "");
              setValue("email", customer?.email || "");
            }
          }}
        >
          {filteredVehicles.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              {v.plate}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="Phone" {...register("phone")} fullWidth />
        <TextField label="Email" {...register("email")} fullWidth />

        <TextField
          label="Problem Description"
          {...register("problemDescription")}
          error={!!errors.problemDescription}
          helperText={errors.problemDescription?.message}
          multiline
          rows={4}
          className="md:col-span-2"
          fullWidth
        />

        <TextField
          label="Estimated Service Cost (MWK)"
          type="number"
          {...register("serviceCost")}
          error={!!errors.serviceCost}
          helperText={errors.serviceCost?.message}
          fullWidth
        />

        <div className="md:col-span-2">
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Generate Quotation
          </Button>
        </div>
      </form>

      <Box className="mt-10">
        <Typography variant="h5" className="mb-4 font-semibold text-gray-800">
          Generated Quotations
        </Typography>
        <div
          style={{ height: quotations.length > 0 ? 500 : 100, width: "100%" }}
        >
          <TextField
            label="Search by Customer or Plate"
            variant="outlined"
            fullWidth
            className="mb-4"
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />

          <DataGrid
            rows={quotations.filter(
              (q) =>
                q.customerName.toLowerCase().includes(searchTerm) ||
                q.plateNumber.toLowerCase().includes(searchTerm)
            )}
            columns={columns}
            pageSizeOptions={[5, 10]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
          />
        </div>
      </Box>
    </Box>
  );
};

export default CreateQuotation;
