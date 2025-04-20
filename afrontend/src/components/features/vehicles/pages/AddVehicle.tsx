import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Autocomplete } from "@mui/material";
import axios from "axios";

const schema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  plateNumber: z.string().min(3, "Plate number is required"),
  model: z.string().min(2, "Model is required"),
  brand: z.string().min(1, "Brand is required"),
  engineNumber: z.string().min(1, "Engine number is required"),
  color: z.string().min(1, "Color is required"),
  createdAt: z.string().min(1, "Date is required"),
  technicianId: z.string().min(1, "Technician is required"),
  supervisorId: z.string().optional(),
  notes: z.string().optional(),
});

const AddVehicle = () => {
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: "",
      plateNumber: "",
      model: "",
      brand: "",
      engineNumber: "",
      color: "",
      createdAt: "",
      technicianId: "",
      supervisorId: "",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchCustomersAndEmployees = async () => {
      try {
        // Fetch customers
        const customerRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/customers`
        );
        const customerList = customerRes.data.data.map((c: any) => ({
          id: c._id,
          name: c.fullName || c.name,
        }));
        setCustomers(customerList);

        // Fetch employees (technicians & supervisors)
        const employeeRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/employees`
        );
        const employeeList = employeeRes.data.data.map((e: any) => ({
          id: e._id,
          name: e.fullName,
        }));
        setEmployees(employeeList);
      } catch (err) {
        console.error(" Failed to load customers or employees:", err);
      }
    };

    fetchCustomersAndEmployees();
  }, []);

  const onSubmit = async (data: any) => {
    const finalData = {
      ...data,
      customerName: selectedCustomer,
      // 🚨 If customerId was not set via Autocomplete selection, skip submission
      customerId: data.customerId?.trim() || null,
    };

    if (!finalData.customerId) {
      toast.error("Please select an existing customer.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/vehicles/add`,
        finalData
      );
      toast.success("Vehicle added successfully");
      console.log(" Vehicle saved:", res.data);
      reset();
      setSelectedCustomer("");
    } catch (err) {
      console.error(" Error adding vehicle:", err);
      toast.error("Failed to add vehicle");
    }
  };

  return (
    <Box className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black">
      <Typography
        variant="h4"
        className="text-center mb-6 font-bold text-gray-800"
      >
        Add Vehicle
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
              setSelectedCustomer(selected.name);
              setValue("customerId", selected.id);
            } else {
              setSelectedCustomer("");
              setValue("customerId", "");
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Customer"
              fullWidth
              error={!!errors.customerId}
              helperText={errors.customerId?.message}
            />
          )}
        />
        <Autocomplete
          options={employees}
          getOptionLabel={(option) => option.name}
          onChange={(_, selected) => {
            setValue("technicianId", selected?.id || "");
          }}
          renderInput={(params) => (
            <TextField {...params} label="Assign Technician" fullWidth />
          )}
        />

        <Autocomplete
          options={employees}
          getOptionLabel={(option) => option.name}
          onChange={(_, selected) => {
            setValue("supervisorId", selected?.id || "");
          }}
          renderInput={(params) => (
            <TextField {...params} label="Assign Supervisor" fullWidth />
          )}
        />

        <TextField
          label="Plate Number"
          {...register("plateNumber")}
          error={!!errors.plateNumber}
          helperText={errors.plateNumber?.message}
          fullWidth
        />

        <TextField
          label="Model"
          {...register("model")}
          error={!!errors.model}
          helperText={errors.model?.message}
          fullWidth
        />

        <TextField
          label="Brand"
          {...register("brand")}
          error={!!errors.brand}
          helperText={errors.brand?.message}
          fullWidth
        />

        <TextField
          label="Engine Number"
          {...register("engineNumber")}
          error={!!errors.engineNumber}
          helperText={errors.engineNumber?.message}
          fullWidth
        />

        <TextField
          label="Color"
          {...register("color")}
          error={!!errors.color}
          helperText={errors.color?.message}
          fullWidth
        />

        <TextField
          label="Created At"
          type="date"
          {...register("createdAt")}
          InputLabelProps={{ shrink: true }}
          error={!!errors.createdAt}
          helperText={errors.createdAt?.message}
          fullWidth
        />

        <TextField
          label="Notes"
          multiline
          rows={3}
          {...register("notes")}
          error={!!errors.notes}
          helperText={errors.notes?.message}
          fullWidth
        />

        <div className="md:col-span-2">
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Save Vehicle
          </Button>
        </div>
      </form>
    </Box>
  );
};

export default AddVehicle;
