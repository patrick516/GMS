import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Autocomplete } from "@mui/material";

const schema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  plateNumber: z.string().min(3, "Plate number is required"),
  model: z.string().min(2, "Model is required"),
  color: z.string().optional(),
});

const AddVehicle = () => {
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: "",
      plateNumber: "",
      model: "",
      color: "",
    },
  });

  useEffect(() => {
    // TODO: Replace with real API to fetch customers
    setCustomers([
      { id: "1", name: "John Banda" },
      { id: "2", name: "Jane Phiri" },
    ]);
  }, []);

  const onSubmit = (data: any) => {
    const finalData = {
      ...data,
      customerName: selectedCustomer,
    };
    console.log("Submitted vehicle:", finalData);
    toast.success("Vehicle added successfully");
    reset();
    setSelectedCustomer("");
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
          freeSolo
          options={customers.map((c) => c.name)}
          onInputChange={(_, value) => setSelectedCustomer(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select or Enter Customer Name"
              fullWidth
              error={!selectedCustomer}
              helperText={!selectedCustomer ? "Customer is required" : ""}
            />
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

        <TextField label="Color" {...register("color")} fullWidth />

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
