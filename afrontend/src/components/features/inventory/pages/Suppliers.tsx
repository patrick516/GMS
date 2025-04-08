import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography, TextField, MenuItem, Button } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { Autocomplete } from "@mui/material";
import { useEffect, useState } from "react";

const schema = z.object({
  supplierName: z.string().min(1, "Supplier name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  productId: z.string().min(1, "Product selection is required"),
  address: z.string().optional(),
});

type SupplierForm = z.infer<typeof schema>;

const Supplier = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SupplierForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierName: "",
      email: "",
      phone: "",
      productId: "",
      address: "",
    },
  });

  const [inventoryList, setInventoryList] = useState<string[]>([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory`
        );
        console.log("Fetched inventory:", response.data);
        const productNames = response.data.map((item: any) => item.name);
        setInventoryList(productNames);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      }
    };

    fetchInventory();
  }, []);

  const onSubmit = async (data: SupplierForm) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/supplier/add`,
        {
          name: data.supplierName,
          email: data.email,
          phone: data.phone,
          company: "",
          address: data.address,
          productId: data.productId,
        }
      );

      console.log("Supplier response:", res.data);
      toast.success("Supplier saved successfully");
      reset();
    } catch (err) {
      console.error(" Error saving supplier:", err);
      toast.error("Error saving supplier");
    }
  };

  return (
    <Box className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black">
      <Typography
        variant="h4"
        className="text-center mb-6 font-bold text-gray-800"
      >
        Add Supplier
      </Typography>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <TextField
          label="Supplier Name"
          {...register("supplierName")}
          error={!!errors.supplierName}
          helperText={errors.supplierName?.message}
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
        />
        <TextField label="Phone" {...register("phone")} fullWidth />
        <Autocomplete
          freeSolo
          disableClearable
          options={inventoryList}
          onChange={(_, value) => setValue("productId", value || "")}
          onInputChange={(_, value) => setValue("productId", value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Product Supplied"
              error={!!errors.productId}
              helperText={errors.productId?.message}
              fullWidth
            />
          )}
        />

        <TextField
          label="Company Address"
          {...register("address")}
          multiline
          rows={2}
          fullWidth
        />
        <div className="md:col-span-2">
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Save Supplier
          </Button>
        </div>
      </form>
    </Box>
  );
};

export default Supplier;
