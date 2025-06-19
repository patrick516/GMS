import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography, TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";

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

  const [inventoryList, setInventoryList] = useState<
    { _id: string; name: string }[]
  >([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/supplier`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuppliers(response.data.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const inventory = response.data.map((item: any) => ({
          _id: item._id,
          name: item.name,
        }));
        setInventoryList(inventory);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      }
    };

    fetchInventory();
    fetchSuppliers();
  }, []);

  const onSubmit = async (data: SupplierForm) => {
    // ✅ Format phone before saving
    const formattedPhone = data.phone?.startsWith("+")
      ? data.phone
      : `+265${data.phone?.replace(/^0+/, "")}`;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/supplier/add`,

        {
          name: data.supplierName,
          email: data.email,
          phone: formattedPhone,
          company: "",
          address: data.address,
          productId: data.productId,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Supplier saved successfully");
      reset();
      fetchSuppliers();
    } catch (err) {
      console.error("Error saving supplier:", err);
      toast.error("Error saving supplier");
    }
  };

  return (
    <Box className="max-w-6xl p-8 mx-auto mt-10 text-black bg-white shadow-xl rounded-xl">
      <Typography
        variant="h4"
        className="mb-6 font-bold text-center text-gray-800"
      >
        Add Supplier
      </Typography>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
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
        <TextField
          label="Phone (use format 099... or +265...)"
          {...register("phone")}
          fullWidth
        />
        <TextField
          label="Product Supplied"
          {...register("productId")}
          error={!!errors.productId}
          helperText={errors.productId?.message}
          fullWidth
        />

        <TextField
          label="Company Address"
          {...register("address")}
          multiline
          rows={2}
          fullWidth
        />
        <div className="md:col-span-2">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="w-60"
          >
            Save Supplier
          </Button>
        </div>
      </form>

      <Box className="mt-10">
        <Typography variant="h6" className="mb-4 font-bold text-gray-800">
          Supplier List
        </Typography>
        {suppliers.length === 0 ? (
          <Typography>No suppliers added yet.</Typography>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Address</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier._id} className="border-t">
                  <td className="p-2">{supplier.name}</td>
                  <td className="p-2">{supplier.email}</td>
                  <td className="p-2">{supplier.phone}</td>
                  <td className="p-2">{supplier.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
    </Box>
  );
};

export default Supplier;
