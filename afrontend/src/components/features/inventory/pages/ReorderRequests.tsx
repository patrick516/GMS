import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { toast } from "react-toastify";

interface Product {
  id: string;
  name: string;
  quantity: number;
  supplierName: string;
  supplierEmail: string;
  lastReorderedAt?: string;
}

const Reorder = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [reordered, setReordered] = useState<string[]>([]); // tracks products already reordered

  useEffect(() => {
    // Step 1: Mock data for now — replace with API calls later
    const addedInventory = [
      {
        id: "1",
        name: "Brake Pads",
        quantity: 50,
        supplierName: "AutoZone Ltd",
        supplierEmail: "contact@autozone.com",
      },
      {
        id: "2",
        name: "Oil Filter",
        quantity: 30,
        supplierName: "MotorParts Co",
        supplierEmail: "orders@motorparts.co",
      },
      {
        id: "3",
        name: "Wiper Blades",
        quantity: 20,
        supplierName: "FastFit",
        supplierEmail: "fastfit@parts.com",
      },
    ];

    const customerPurchases = [
      { productId: "1", quantity: 40 }, // Brake Pads
      { productId: "2", quantity: 25 }, // Oil Filter
    ];

    const damagedItems = [
      { productId: "1", quantity: 6 },
      { productId: "3", quantity: 5 },
    ];

    // Step 2: Calculate remaining stock
    const remainingProducts = addedInventory.map((item) => {
      const purchased =
        customerPurchases.find((p) => p.productId === item.id)?.quantity || 0;
      const damaged =
        damagedItems.find((d) => d.productId === item.id)?.quantity || 0;
      const remainingQuantity = item.quantity - (purchased + damaged);

      return {
        ...item,
        quantity: remainingQuantity,
      };
    });

    // Step 3: Filter low stock
    const lowStock = remainingProducts.filter((p) => p.quantity < 10);
    setProducts(lowStock);
  }, []);

  const handleReorder = (product: Product) => {
    // TODO: Replace with real email trigger API (send reorder email to supplier)
    if (reordered.includes(product.id)) return;

    toast.info(`Reorder email sent to ${product.supplierEmail}`);
    setReordered((prev) => [...prev, product.id]);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "Product ID", width: 120 },
    { field: "name", headerName: "Product Name", flex: 1 },
    { field: "supplierName", headerName: "Supplier", flex: 1 },
    { field: "quantity", headerName: "Current Stock", width: 140 },
    {
      field: "lastReorderedAt",
      headerName: "Last Reordered",
      width: 180,
      valueFormatter: (params) => {
        const value = params?.value;
        return value ? new Date(value).toLocaleString() : "N/A";
      },
    },
    {
      field: "action",
      headerName: "",
      width: 160,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          disabled={reordered.includes(params.row.id)}
          onClick={() => handleReorder(params.row)}
          fullWidth
        >
          {reordered.includes(params.row.id) ? "Reordered" : "Reorder"}
        </Button>
      ),
    },
  ];

  return (
    <Box className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black">
      <Typography
        variant="h4"
        className="text-center mb-6 font-bold text-gray-800"
      >
        Reorder Low Stock Items
      </Typography>

      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={products}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
      </div>
    </Box>
  );
};

export default Reorder;
