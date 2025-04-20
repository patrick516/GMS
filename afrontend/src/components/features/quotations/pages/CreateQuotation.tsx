import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
    { name: string; phone?: string; email?: string; id: string }[]
  >([]);

  const [vehicles, setVehicles] = useState<
    {
      id: string;
      plate: string;
      model: string;
      ownerName: string;
      ownerId: string;
    }[]
  >([]);

  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
    email?: string;
    phone?: string;
    id: string;
  } | null>(null);

  const [selectedVehicle, setSelectedVehicle] = useState<{
    id: string;
    plate: string;
    model: string;
    ownerName: string;
    ownerId: string;
  } | null>(null);

  const [quotations, setQuotations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const watchedVehicleId = watch("vehicleId");

  const fetchQuotations = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/quotations/all`
      );
      setQuotations(res.data.data);
    } catch (err) {
      console.error("Failed to fetch quotations:", err);
    }
  };

  const fetchData = async () => {
    try {
      const customerRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/vehicles/customers-with-vehicles`
      );
      const realCustomers = customerRes.data.data.map((c: any) => ({
        name: c.name,
        email: c.email || "",
        phone: c.phone || "",
        id: c._id?.toString() || c.id?.toString() || "",
      }));
      setCustomers(realCustomers);

      const vehicleRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/vehicles/list`
      );
      const vehicleList = vehicleRes.data.data.map((v: any) => ({
        id: v._id,
        plate: v.plateNumber,
        model: v.model,
        ownerId:
          v.customerId?._id?.toString() || v.customerId?.toString() || "",
        ownerName: v.customerId?.fullName || v.customerName || "Unknown",
      }));
      setVehicles(vehicleList);

      await fetchQuotations(); // fetch only after customers and vehicles
    } catch (err) {
      console.error("Failed to load quotation-related data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredVehicles = selectedCustomer?.id
    ? vehicles.filter((v) => v.ownerId === selectedCustomer.id)
    : [];

  const onSubmit = async (data: any) => {
    const vehicle = vehicles.find((v) => v.id === data.vehicleId);
    if (vehicle && vehicle.ownerName !== data.customerName) {
      toast.error("Selected vehicle does not belong to the selected customer");
      return;
    }

    const payload = {
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      plateNumber: vehicle?.plate,
      model: vehicle?.model,
      problemDescription: data.problemDescription,
      serviceCost: data.serviceCost,
      status: "pending",
      paymentStatus: "UnPaid",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/quotations/add`,
        payload
      );
      const savedQuote = res.data.data;

      setQuotations((prev) => [...prev, savedQuote]);
      toast.success("Quotation created. Click 'Done' to generate invoice.");

      reset();
      setSelectedCustomer(null);
      setSelectedVehicle(null);
    } catch (err) {
      console.error("Failed to save quotation:", err);
      toast.error("Failed to create quotation");
    }
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

  const handleMarkAsInvoiced = async (id: string) => {
    const quote = quotations.find((q) => q._id === id || q.id === id);
    if (!quote) return;

    const payload = {
      customerName: quote.customerName,
      phone: quote.phone,
      email: quote.email,
      plateNumber: quote.plateNumber,
      model: quote.model,
      problemDescription: quote.problemDescription,
      serviceCost: quote.serviceCost,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/invoices/add`,
        payload
      );

      const saved = res.data.data;

      // ✅ Update status in DB
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/quotations/mark-invoiced/${quote._id}`
      );

      // ✅ Refresh list
      await fetchQuotations();

      toast.success("Invoice saved & quotation marked as invoiced.");
    } catch (err) {
      console.error("Failed to save invoice:", err);
      toast.error("Failed to generate invoice.");
    }
  };

  const handleViewInvoice = async (id: string) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/quotations/archive/${id}`
      );
      setQuotations((prev) => prev.filter((q) => (q._id || q.id) !== id));
      navigate(`/invoices/${id}`);
    } catch (err) {
      console.error("Failed to archive quotation:", err);
      toast.error("Could not archive the quotation");
    }
  };

  const generateBulkPDF = () => {
    const selectedQuotes = quotations.filter((q) =>
      selectedIds.includes(q._id || q.id)
    );

    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/logos/uas-motors-logo.png";

    logo.onload = () => {
      selectedQuotes.forEach((quote, index) => {
        const isNewPage = index > 0 && index % 2 === 0;
        if (isNewPage) doc.addPage();

        const yStart = 20 + (index % 2) * 120;

        doc.addImage(logo, "PNG", 10, yStart, 30, 30);
        doc.setFontSize(14);
        doc.text("Uas Motors Garage System - Quotation", 50, yStart + 10);

        autoTable(doc, {
          startY: yStart + 30,
          head: [["Field", "Details"]],
          body: [
            ["Quotation ID", quote._id || quote.id],
            ["Customer", quote.customerName],
            ["Phone", quote.phone],
            ["Email", quote.email],
            ["Plate Number", quote.plateNumber],
            ["Model", quote.model],
            ["Problem Description", quote.problemDescription],
            ["Service Cost", `${quote.serviceCost} MWK`],
          ],
          styles: { fontSize: 9 },
          headStyles: { fillColor: [22, 160, 133] },
        });

        // Remove thank you message for quotation
      });

      doc.save("selected_quotations.pdf");
    };
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

        if (row.status === "invoiced") {
          return (
            <Button
              variant="outlined"
              color="primary"
              onClick={() =>
                handleViewInvoice(row._invoiceId || row._id || row.id)
              }
            >
              View Invoice
            </Button>
          );
        }

        return (
          <Button
            variant="outlined"
            color="success"
            onClick={() => handleMarkAsInvoiced(row._id || row.id)}
          >
            Done
          </Button>
        );
      },
    },
  ];

  return (
    <Box className="h-[90vh] max-w-7xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black flex flex-col">
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
          options={customers}
          getOptionLabel={(option) => option.name}
          onChange={(_, selected) => {
            if (selected) {
              setSelectedCustomer(selected);
              setValue("customerName", selected.name);
              setValue("phone", selected.phone || "");
              setValue("email", selected.email || "");

              const matches = vehicles.filter((v) => v.ownerId === selected.id);
              if (matches.length === 1) {
                const vehicle = matches[0];
                setValue("vehicleId", vehicle.id);
                toast.info(`Auto-selected vehicle: ${vehicle.plate}`);
              }
            } else {
              setSelectedCustomer(null);
              setValue("customerName", "");
              setValue("phone", "");
              setValue("email", "");
              setValue("vehicleId", "");
            }
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
          value={watchedVehicleId}
          {...register("vehicleId")}
          error={!!errors.vehicleId}
          helperText={errors.vehicleId?.message}
          fullWidth
          onChange={(e) => {
            const vehicle = vehicles.find((v) => v.id === e.target.value);
            setValue("vehicleId", e.target.value);
            setSelectedVehicle(vehicle || null);

            if (vehicle) {
              const matchedCustomer = customers.find(
                (c) => c.name === vehicle.ownerName
              );
              if (matchedCustomer) {
                setSelectedCustomer(matchedCustomer);
              }

              setValue("customerName", vehicle.ownerName);
              const customer = customers.find(
                (c) => c.name === vehicle.ownerName
              );
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
          style={{ height: quotations.length > 0 ? 300 : 100, width: "100%" }}
        >
          <TextField
            label="Search by Customer or Plate"
            variant="outlined"
            fullWidth
            className="mb-4"
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
          <Button
            variant="outlined"
            color="secondary"
            className="mt-4"
            disabled={selectedIds.length === 0}
            onClick={generateBulkPDF}
          >
            Download Selected Quotation
          </Button>

          <DataGrid
            checkboxSelection
            onRowSelectionModelChange={(ids) => {
              setSelectedIds(ids as string[]);
            }}
            rowSelectionModel={selectedIds}
            rows={quotations
              .filter((q) => !q.isArchived && q.status !== "invoiced")
              .map((q) => ({
                ...q,
                id: q._id || q.id,
              }))
              .filter(
                (q) =>
                  q.customerName.toLowerCase().includes(searchTerm) ||
                  q.plateNumber.toLowerCase().includes(searchTerm)
              )}
            columns={columns}
            pageSizeOptions={[3, 10]}
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
