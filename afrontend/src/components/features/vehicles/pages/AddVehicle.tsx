import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Autocomplete } from "@mui/material";
import axios from "axios";

const schema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
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

type VehicleFormData = z.infer<typeof schema>;

const AddVehicle = () => {
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: "",
      customerName: "",
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
        const token = localStorage.getItem("token");

        const customerRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/customers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const customerList = customerRes.data.data.map((c: any) => ({
          id: c._id,
          name:
            c.fullName ||
            c.name ||
            c.username ||
            c.email?.split("@")[0] ||
            "Unnamed",
        }));
        setCustomers(customerList);

        const employeeRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/employees`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const employeeList = employeeRes.data.data.map((e: any) => ({
          id: e._id,
          name: e.fullName || e.name || e.email?.split("@")[0] || "Unnamed",
        }));
        setEmployees(employeeList);
      } catch (err) {
        console.error("Failed to load customers or employees:", err);
        toast.error("Authorization failed or server error.");
      }
    };

    fetchCustomersAndEmployees();
  }, []);

  const onSubmit = async (data: VehicleFormData) => {
    const finalData = {
      ...data,
      customerId: data.customerId?.trim() || null,
    };

    try {
      const token = localStorage.getItem("token");
      console.log("Final payload:", finalData);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/vehicles/add`,
        finalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Vehicle added successfully");
      reset();
    } catch (err) {
      console.error("Error adding vehicle:", err);
      toast.error("Failed to add vehicle");
    }
  };

  return (
    <Box className="max-w-4xl p-8 mx-auto mt-10 text-black bg-white shadow-xl rounded-xl">
      <Typography
        variant="h4"
        className="mb-6 font-bold text-center text-gray-800"
      >
        Add Vehicle
      </Typography>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {/* Customer field (select or type) */}
        <Controller
          name="customerName"
          control={control}
          render={({ field }) => (
            <Autocomplete
              freeSolo
              options={customers}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.name
              }
              onChange={(_, selected) => {
                if (typeof selected === "string") {
                  setValue("customerName", selected);
                  setValue("customerId", "");
                } else if (selected) {
                  setValue("customerName", selected.name);
                  setValue("customerId", selected.id);
                } else {
                  setValue("customerName", "");
                  setValue("customerId", "");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  {...field}
                  id="customerName"
                  name="customerName"
                  label="Customer (select or type)"
                  autoComplete="off"
                  error={!!errors.customerName}
                  helperText={errors.customerName?.message}
                  fullWidth
                />
              )}
            />
          )}
        />

        {/* Technician */}
        <Autocomplete
          options={employees}
          getOptionLabel={(option) => option.name}
          onChange={(_, selected) => {
            setValue("technicianId", selected?.id || "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Assign Technician"
              id="technicianId"
              name="technicianId"
              error={!!errors.technicianId}
              helperText={errors.technicianId?.message}
              fullWidth
            />
          )}
        />

        {/* Supervisor */}
        <Autocomplete
          options={employees}
          getOptionLabel={(option) => option.name}
          onChange={(_, selected) => {
            setValue("supervisorId", selected?.id || "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Assign Supervisor"
              id="supervisorId"
              name="supervisorId"
              fullWidth
            />
          )}
        />

        <TextField
          label="Plate Number"
          id="plateNumber"
          {...register("plateNumber")}
          name="plateNumber"
          autoComplete="off"
          error={!!errors.plateNumber}
          helperText={errors.plateNumber?.message}
          fullWidth
        />

        <TextField
          label="Model"
          id="model"
          {...register("model")}
          name="model"
          autoComplete="off"
          error={!!errors.model}
          helperText={errors.model?.message}
          fullWidth
        />

        <TextField
          label="Brand"
          id="brand"
          {...register("brand")}
          name="brand"
          autoComplete="off"
          error={!!errors.brand}
          helperText={errors.brand?.message}
          fullWidth
        />

        <TextField
          label="Engine Number"
          id="engineNumber"
          {...register("engineNumber")}
          name="engineNumber"
          autoComplete="off"
          error={!!errors.engineNumber}
          helperText={errors.engineNumber?.message}
          fullWidth
        />

        <TextField
          label="Color"
          id="color"
          {...register("color")}
          name="color"
          autoComplete="off"
          error={!!errors.color}
          helperText={errors.color?.message}
          fullWidth
        />

        <TextField
          label="Created At"
          type="date"
          id="createdAt"
          {...register("createdAt")}
          name="createdAt"
          InputLabelProps={{ shrink: true }}
          error={!!errors.createdAt}
          helperText={errors.createdAt?.message}
          fullWidth
        />

        <TextField
          label="Notes"
          id="notes"
          {...register("notes")}
          name="notes"
          autoComplete="off"
          multiline
          rows={3}
          error={!!errors.notes}
          helperText={errors.notes?.message}
          fullWidth
        />

        <div className="md:col-span-2">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
          >
            Save Vehicle
          </Button>
        </div>
      </form>
    </Box>
  );
};

export default AddVehicle;
