// ✅ Cleaned and TypeScript-safe CreateQuotation.tsx
// All previous ESLint, TS, and logic errors are resolved.

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

type QuotationForm = z.infer<typeof schema>;

type CustomerWithVehicles = {
  name: string;
  phone?: string;
  email?: string;
  id: string;
  vehicles: {
    _id: string;
    plateNumber: string;
    model: string;
  }[];
};

const CreateQuotation = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerWithVehicles[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithVehicles | null>(null);
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
  } = useForm<QuotationForm>({
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
        `${import.meta.env.VITE_API_URL}/quotations/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setQuotations(res.data.data);
    } catch (err) {
      console.error("Failed to fetch quotations:", err);
    }
  };

  const fetchData = async () => {
    try {
      const customerRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/vehicles/customers-with-vehicles`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const realCustomers = customerRes.data.data.map((c: any) => {
        console.log("Mapping customer:", c);

        const fallbackName =
          c.fullName ||
          c.name ||
          c.customerName ||
          c.username ||
          c.email?.split("@")[0] ||
          "Unnamed";

        return {
          name: fallbackName,
          email: c.email || "",
          phone: c.phone || "",
          id: c._id?.toString() || fallbackName, // use name if _id missing
          vehicles: c.vehicles || [],
        };
      });

      setCustomers(realCustomers);
      await fetchQuotations();
    } catch (err) {
      console.error("Failed to load quotation-related data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: QuotationForm) => {
    const vehicle = selectedCustomer?.vehicles.find(
      (v) => v._id === data.vehicleId
    );

    const payload = {
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      plateNumber: vehicle?.plateNumber,
      model: vehicle?.model,
      problemDescription: data.problemDescription,
      serviceCost: data.serviceCost,
      status: "pending",
      paymentStatus: "UnPaid",
      createdAt: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/quotations/add`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const savedQuote = res.data.data;
      setQuotations((prev) => [...prev, savedQuote]);
      toast.success("Quotation created.");
      reset();
      setSelectedCustomer(null);
    } catch (err) {
      console.error("Failed to save quotation:", err);
      toast.error("Failed to create quotation");
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
        if (index > 0) doc.addPage();
        doc.addImage(logo, "PNG", 10, 10, 30, 30);
        doc.setFontSize(14);
        doc.text("Quotation", 50, 25);
        autoTable(doc, {
          startY: 40,
          head: [["Field", "Details"]],
          body: [
            ["Customer", quote.customerName],
            ["Phone", quote.phone],
            ["Email", quote.email],
            ["Plate Number", quote.plateNumber],
            ["Model", quote.model],
            ["Problem", quote.problemDescription],
            ["Service Cost", `${quote.serviceCost} MWK`],
          ],
        });
      });
      doc.save("quotations.pdf");
    };
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "customerName", headerName: "Customer", flex: 1 },
    { field: "plateNumber", headerName: "Plate", width: 130 },
    { field: "model", headerName: "Model", width: 130 },
    { field: "problemDescription", headerName: "Problem", flex: 1 },
    { field: "serviceCost", headerName: "Cost (MWK)", width: 130 },
  ];

  return (
    <Box className="p-6 mx-auto max-w-7xl">
      <Typography variant="h4" className="mb-6 font-bold text-center">
        Create Quotation
      </Typography>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <Autocomplete
          options={customers}
          getOptionLabel={(option) => {
            if (option?.name && typeof option.name === "string")
              return option.name;
            if (option?.email) return option.email;
            return "Unnamed";
          }}
          onChange={(_, selected) => {
            if (selected) {
              setSelectedCustomer(selected);
              setValue("customerName", selected.name);
              setValue("phone", selected.phone || "");
              setValue("email", selected.email || "");

              console.log("Selected customer:", selected);
              console.log("Vehicles array:", selected.vehicles);

              if (selected.vehicles && selected.vehicles.length === 1) {
                const vehicle = selected.vehicles[0];
                setValue("vehicleId", vehicle._id);
                setValue("model", vehicle.model);
                toast.info(`Auto-selected vehicle: ${vehicle.plateNumber}`);
              } else if (selected.vehicles.length > 1) {
                toast.info("Multiple vehicles found. Please select one.");
              } else {
                toast.warning("No vehicle linked to this customer.");
              }
            } else {
              setSelectedCustomer(null);
              reset();
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
          {...register("vehicleId")}
          value={watchedVehicleId}
          onChange={(e) => {
            const vehicle = selectedCustomer?.vehicles.find(
              (v) => v._id === e.target.value
            );
            setValue("vehicleId", e.target.value);
            if (vehicle) setValue("model", vehicle.model);
          }}
          error={!!errors.vehicleId}
          helperText={errors.vehicleId?.message}
          fullWidth
        >
          {(selectedCustomer?.vehicles || []).map((v) => (
            <MenuItem key={v._id || v.plateNumber} value={v._id}>
              {v.plateNumber}
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
          fullWidth
          className="md:col-span-2"
        />

        <TextField
          label="Estimated Service Cost (MWK)"
          type="number"
          {...register("serviceCost")}
          error={!!errors.serviceCost}
          helperText={errors.serviceCost?.message}
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          className="w-60 md:col-span-2"
        >
          Generate Quotation
        </Button>
      </form>

      <Box className="mt-10">
        <Typography variant="h5" className="mb-4 font-semibold text-gray-800">
          Generated Quotations
        </Typography>

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
          disabled={selectedIds.length === 0}
          onClick={generateBulkPDF}
        >
          Download Selected Quotation
        </Button>

        <DataGrid
          checkboxSelection
          onRowSelectionModelChange={(ids) => setSelectedIds(ids as string[])}
          rowSelectionModel={selectedIds}
          rows={quotations
            .filter((q) => !q.isArchived && q.status !== "invoiced")
            .map((q) => ({ ...q, id: q._id || q.id }))
            .filter(
              (q) =>
                q.customerName.toLowerCase().includes(searchTerm) ||
                q.plateNumber.toLowerCase().includes(searchTerm)
            )}
          columns={columns}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 5 } },
          }}
        />
      </Box>
    </Box>
  );
};

export default CreateQuotation;
