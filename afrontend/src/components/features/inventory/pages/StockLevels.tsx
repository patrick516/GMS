import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography, Button } from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const systemUser = {
  name: "Garage Admin",
  phone: "+265995049331",
  email: "kulinjipatricks@gmail.com",
};

const CRITICAL_STOCK_THRESHOLD = 5;

interface Supplier {
  name?: string;
  phone?: string;
  email?: string;
}

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  totalPurchased: number;
  currentStock: number;
  supplier?: Supplier;
}

const StockLevels = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [reorderedIds, setReorderedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchStockLevels = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory/stock-levels`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const inventory: InventoryItem[] = response.data.data;

        const formatted = inventory.map((item) => ({
          id: item._id,
          name: item.name,
          initialStock: item.quantity,
          sold: item.totalPurchased,
          remaining: item.currentStock,
          supplier: item.supplier || null,
        }));

        setRows(formatted);
      } catch (error) {
        console.error("Error fetching stock levels:", error);
      }
    };

    fetchStockLevels();
  }, []);

  const handleReorder = async (item: any) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/reorder/whatsapp`,
        {
          supplierName: item.supplier.name,
          supplierPhone: item.supplier.phone,
          productName: item.name,
          systemUserName: systemUser.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Reorder message sent to supplier via WhatsApp");
    } catch (err) {
      console.error("WhatsApp reorder failed:", err);
      toast.error("Failed to send WhatsApp reorder message");
    }

    setReorderedIds((prev) => [...prev, item.id]);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Product Name", flex: 1 },
    { field: "initialStock", headerName: "Initial Stock", width: 150 },
    { field: "sold", headerName: "Sold", width: 120 },
    { field: "remaining", headerName: "Remaining", width: 140 },
    {
      field: "supplier",
      headerName: "Reorder",
      flex: 1,
      renderCell: (params) => {
        const item = params.row;
        const supplier = item.supplier;
        const isCritical = item.remaining <= CRITICAL_STOCK_THRESHOLD;

        if (!supplier || !supplier.phone || !isCritical) {
          return <span className="text-gray-400">N/A</span>;
        }

        return (
          <Button
            variant="contained"
            color="primary"
            disabled={reorderedIds.includes(item.id)}
            onClick={() => handleReorder(item)}
          >
            {reorderedIds.includes(item.id) ? "Reordered" : "Reorder"}
          </Button>
        );
      },
    },
  ];

  return (
    <Box className="max-w-6xl p-8 mx-auto mt-10 text-black bg-white shadow-xl rounded-xl">
      <Typography
        variant="h4"
        className="mb-6 font-bold text-center text-gray-800"
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
      <ToastContainer />
    </Box>
  );
};

export default StockLevels;
