import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

// Zod schema for validation
const schema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantityDamaged: z.coerce.number().min(1, "Quantity is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["Disposed", "Pending Replacement", "Repairable"]),
});
type DamagedItemForm = z.infer<typeof schema>;

const DamagedItems = () => {
  const [inventoryList, setInventoryList] = useState<
    { id: string; name: string; costPerUnit: number }[]
  >([]);
  const [damagedList, setDamagedList] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DamagedItemForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: "",
      quantityDamaged: 1,
      description: "",
      status: "Disposed",
    },
  });

  useEffect(() => {
    // TODO: Replace with API call to fetch inventory
    const fetchInventory = async () => {
      const data = [
        { id: "1", name: "Brake Pads", costPerUnit: 20 },
        { id: "2", name: "Oil Filter", costPerUnit: 15 },
      ];
      setInventoryList(data);
    };
    fetchInventory();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const selectedProduct = inventoryList.find(
        (item) => item.id === data.productId
      );

      const totalPrice =
        (selectedProduct?.costPerUnit || 0) * data.quantityDamaged;

      const entry = {
        ...data,
        productName: selectedProduct?.name || "Unknown",
        costPerUnit: selectedProduct?.costPerUnit || 0,
        totalPrice,
        reportedAt: new Date().toISOString(),
      };

      setDamagedList((prev) => [...prev, entry]);
      toast.success("Damage report submitted");
    } catch (error) {
      toast.error("Failed to submit damage report");
    }
  };

  const columns: GridColDef[] = [
    { field: "productId", headerName: "Product ID", width: 120 },
    { field: "productName", headerName: "Name", width: 180 },
    { field: "quantityDamaged", headerName: "Quantity Damaged", width: 160 },
    { field: "costPerUnit", headerName: "Unit Price", width: 120 },
    { field: "totalPrice", headerName: "Total Price", width: 130 },
    { field: "description", headerName: "Reason", flex: 1 },
    { field: "status", headerName: "Status", width: 180 },
  ];

  return (
    <Box className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black">
      <Typography
        variant="h4"
        className="text-center mb-6 font-bold text-gray-800"
      >
        Report Damaged Item
      </Typography>
      <form
        role="form"
        aria-labelledby="form-title"
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <TextField
          select
          id="productId"
          label="Select Inventory"
          {...register("productId")}
          error={!!errors.productId}
          helperText={errors.productId?.message}
          fullWidth
        >
          {inventoryList.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          id="quantityDamaged"
          type="number"
          label="Quantity Damaged"
          {...register("quantityDamaged")}
          error={!!errors.quantityDamaged}
          helperText={errors.quantityDamaged?.message}
          fullWidth
        />

        <TextField
          id="description"
          label="Damage Description"
          {...register("description")}
          error={!!errors.description}
          helperText={errors.description?.message}
          multiline
          rows={4}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="status-label">Damage Status</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            {...register("status")}
            defaultValue="Disposed"
          >
            <MenuItem value="Disposed">Disposed</MenuItem>
            <MenuItem value="Pending Replacement">Pending Replacement</MenuItem>
            <MenuItem value="Repairable">Repairable</MenuItem>
          </Select>
        </FormControl>

        <div className="md:col-span-2">
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit Damage Report
          </Button>
        </div>
      </form>

      {/* Table of submitted damaged items */}
      <Box className="mt-10">
        <Typography variant="h5" className="mb-4 font-semibold text-gray-800">
          Reported Damaged Items
        </Typography>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={damagedList.map((item, index) => ({
              id: index + 1,
              ...item,
            }))}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                  page: 0,
                },
              },
            }}
            pageSizeOptions={[5, 10]}
          />
        </div>
      </Box>
    </Box>
  );
};

export default DamagedItems;
