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
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory`
        );
        const formatted = response.data.map((item: any, index: number) => ({
          ...item,
          id: item._id || index + 1, // DataGrid requires an 'id' field
        }));
        setInventoryItems(formatted);
        formatted.forEach((item: any) =>
          console.log("Item:", item.name, "| createdAt:", item.createdAt)
        );
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
      width: 130,
      valueGetter: (params: any) => {
        const row = params?.row || {};
        return (row.purchasedQuantity || 0) * (row.salePricePerUnit || 0);
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
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
            title="Edit"
            onClick={() => handleEdit(params.row)}
          />
          <FaTrash
            className="text-red-600 hover:text-red-800 cursor-pointer"
            title="Delete"
            onClick={() => handleDelete(params.row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-10xl mt-20 mx-auto bg-white text-black p-10 rounded-xl shadow-xl">
      <h2 className="text-4xl font-bold mb-6 text-center">Inventory List</h2>

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
