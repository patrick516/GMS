import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import { FaCheckCircle, FaClock } from "react-icons/fa";

interface ReorderEntry {
  _id: string;
  productName: string;
  systemUserName: string;
  createdAt: string;
  status: string;
  supplierId?: {
    name: string;
    email: string;
    phone: string;
  };
}

const Reorder = () => {
  const [rows, setRows] = useState<ReorderEntry[]>([]);

  useEffect(() => {
    const fetchReorders = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/reorder/list`
        );
        setRows(res.data.data);
      } catch (err) {
        console.error("Error fetching reorder history:", err);
      }
    };

    fetchReorders();
  }, []);

  const handleMarkDone = async (id: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/reorder/mark-done/${id}`
      );
      setRows((prev) =>
        prev.map((row) => (row._id === id ? { ...row, status: "Done" } : row))
      );
    } catch (err) {
      console.error("Failed to mark as done:", err);
    }
  };

  const columns: GridColDef[] = [
    { field: "productName", headerName: "Product", flex: 1 },
    { field: "systemUserName", headerName: "Requested By", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) =>
        params.value === "Done" ? (
          <FaCheckCircle
            title="Done"
            className="text-green-600"
            style={{ fontSize: "1.25rem" }}
          />
        ) : (
          <FaClock
            title="Pending"
            className="text-orange-500 animate-pulse"
            style={{ fontSize: "1.25rem" }}
          />
        ),
    },
    {
      field: "supplier",
      headerName: "Supplier",
      flex: 1,
      valueGetter: (params: any) =>
        params?.row?.supplierId?.name ? params.row.supplierId.name : "N/A",
    },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params: any) => {
        const reorder = params.row;
        if (reorder.status === "Done") {
          return (
            <Typography variant="body2">
              {new Date(reorder.createdAt).toLocaleDateString()}
            </Typography>
          );
        }
        return (
          <Button
            onClick={() => handleMarkDone(reorder._id)}
            variant="outlined"
            color="success"
            size="small"
          >
            <FaCheckCircle />
          </Button>
        );
      },
    },
  ];

  return (
    <Box className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black">
      <Typography
        variant="h4"
        className="text-center mb-6 font-bold text-gray-800"
      >
        Reorder Log
      </Typography>
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          pagination
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
