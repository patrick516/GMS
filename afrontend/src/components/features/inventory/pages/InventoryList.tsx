import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddInventory from "./AddInventory";
import { FaPenToSquare, FaTrash } from "react-icons/fa6";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface InventoryItem {
  id: number;
  name: string;
  brand: string;
  quantity: number;
  costPerUnit: number;
  totalCosts: number;
  salePricePerUnit: number;
  createdAt: string;
  purchasedQuantity?: number;
}

const InventoryList = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("token");

        const [inventoryRes, salesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/inventory`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(
            `${import.meta.env.VITE_API_URL}/inventory/report-detailed`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        const inventoryList = inventoryRes.data;
        const salesData = salesRes.data.data;

        const formatted = inventoryList.map((item: any, index: number) => {
          const match = salesData.find((s: any) => s._id === item._id);

          console.log("✅ MATCH FOUND:", {
            name: item.name,
            cost: item.totalCosts,
            sales: match?.calculatedSales,
          });

          return {
            ...item,
            id: item._id || index + 1,
            calculatedSales: match?.calculatedSales || 0,
            totalCosts: Number(item.totalCosts) || 0,
          };
        });

        setInventoryItems(formatted);
      } catch (error) {
        console.error("Error fetching inventory list:", error);
      }
    };

    fetchInventory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/inventory/${id}`);
      setInventoryItems((prev) =>
        prev.filter((item) => item.id.toString() !== id)
      );
      toast.success("Inventory item deleted successfully");
    } catch (error) {
      toast.error("Error deleting inventory item");
      console.error("Error deleting inventory item:", error);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setSelectedItem(null);
  };

  const handleUpdate = (updatedItem: InventoryItem) => {
    setInventoryItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    handleCloseEdit();
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", width: 160 },
    { field: "brand", headerName: "Brand", width: 160 },
    { field: "quantity", headerName: "Quantity", width: 150 },
    { field: "costPerUnit", headerName: "Cost/Unit (MK)", width: 200 },
    { field: "totalCosts", headerName: "Total (MK)", width: 150 },
    {
      field: "calculatedSales",
      headerName: "Sales (MK)",
      width: 150,
    },
    {
      field: "profit",
      headerName: "Profit (MK)",
      width: 160,
      renderCell: (params) => {
        const sales = Number(params.row.calculatedSales || 0);
        const cost = Number(params.row.totalCosts || 0);
        const profit = sales - cost;

        return (
          <span
            style={{ color: profit < 0 ? "red" : "green", fontWeight: 600 }}
          >
            {profit.toLocaleString("en-MW")}
          </span>
        );
      },
    },

    {
      field: "profitMargin",
      headerName: "Profit Margin (%)",
      width: 180,
      renderCell: (params) => {
        const sales = Number(params.row.calculatedSales || 0);
        const cost = Number(params.row.totalCosts || 0);

        if (cost === 0) return "—";

        const profit = sales - cost;
        const margin = (profit / cost) * 100;

        return (
          <span
            style={{ color: margin < 0 ? "red" : "green", fontWeight: 600 }}
          >
            {margin.toFixed(1)}%
          </span>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Date & Time",
      width: 200,
      renderCell: (params: any) => {
        const value = params.row?.createdAt;
        if (!value) return "N/A";
        try {
          return new Date(value).toLocaleString();
        } catch {
          return "Invalid Date";
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <FaPenToSquare
            className="text-blue-600 cursor-pointer hover:text-blue-800"
            title="Edit"
            onClick={() => handleEdit(params.row)}
          />
          <FaTrash
            className="text-red-600 cursor-pointer hover:text-red-800"
            title="Delete"
            onClick={() => handleDelete(params.row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-10 mx-auto mt-20 text-black bg-white shadow-xl max-w-10xl rounded-xl">
      <h2 className="mb-6 text-4xl font-bold text-center">Inventory List</h2>

      {isEditing && selectedItem && (
        <AddInventory
          itemToEdit={selectedItem}
          onClose={handleCloseEdit}
          onUpdate={handleUpdate}
        />
      )}

      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={inventoryItems}
          columns={columns}
          pagination
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
                page: 0,
              },
            },
          }}
          disableRowSelectionOnClick
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
          }}
        />
      </div>
    </div>
  );
};

export default InventoryList;
