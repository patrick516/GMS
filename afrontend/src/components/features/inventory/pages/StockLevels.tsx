import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import axios from "axios";

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  totalPurchased: number;
  currentStock: number;
}

const StockLevels = () => {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const fetchStockLevels = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory/stock-levels`
        );
        const inventory: InventoryItem[] = response.data.data;

        const formatted = inventory.map((item, index) => ({
          id: item._id,
          name: item.name,
          initialStock: item.quantity,
          sold: item.totalPurchased,
          remaining: item.currentStock,
        }));

        setRows(formatted);
      } catch (error) {
        console.error("Error fetching stock levels:", error);
      }
    };

    fetchStockLevels();
  }, []);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Product Name", flex: 1 },
    { field: "initialStock", headerName: "Initial Stock", width: 150 },
    { field: "sold", headerName: "Sold", width: 120 },
    { field: "remaining", headerName: "Remaining", width: 140 },
  ];

  return (
    <Box className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black">
      <Typography
        variant="h4"
        className="text-center mb-6 font-bold text-gray-800"
      >
        Stock Levels
      </Typography>

      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
                page: 0,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          sx={{
            fontSize: "1rem",
            fontFamily: "Inter, sans-serif",
            color: "#000",
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f3f4f6",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #e5e7eb",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f9fafb",
            },
          }}
        />
      </div>
    </Box>
  );
};

export default StockLevels;
