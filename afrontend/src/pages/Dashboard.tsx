import { Box, Typography, Paper, Divider } from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchVehicleList,
  fetchInventoryReport,
  fetchAllQuotations,
} from "@services/ReportsService";

// --- Type definitions ---
interface InventoryItem {
  name: string;
  quantity: number;
  totalPurchased: number;
  totalSold: number;
  cost?: number;
  revenue?: number;
}

interface FinanceStat {
  name: string;
  value: number;
}

interface VehicleItem {
  _id: string;
  plateNumber: string;
  model: string;
  createdAt: string;
  isDone: boolean;
}

interface ServiceStat {
  name: string;
  count: number;
}

const Dashboard = () => {
  const [inventoryStats, setInventoryStats] = useState<InventoryItem[]>([]);
  const [financeStats, setFinanceStats] = useState<FinanceStat[]>([]);
  const [vehicleQueue, setVehicleQueue] = useState<VehicleItem[]>([]);
  const [topServices, setTopServices] = useState<ServiceStat[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 3;

  const COLORS = ["#6EC1E4", "#F67280", "#355C7D", "#C06C84", "#6EC1E4"];

  // Inventory bar chart data
  useEffect(() => {
    fetchInventoryReport().then((res) => {
      const items: any[] = res?.data?.detailed || [];

      const chartData: InventoryItem[] = items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        totalPurchased: item.quantity,
        totalSold: item.soldQty,
        cost: item.purchaseValue,
        revenue: item.saleValue,
      }));

      setInventoryStats(chartData);
    });
  }, []);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const inventoryRes = await fetchInventoryReport();
        const items: InventoryItem[] = (inventoryRes?.data?.detailed || []).map(
          (item: any) => ({
            name: item.name,
            quantity: item.quantity,
            totalPurchased: item.quantity,
            totalSold: item.soldQty,
            cost: item.purchaseValue,
            revenue: item.saleValue,
          })
        );

        const cost = items.reduce((sum, item) => sum + (item.cost || 0), 0);
        const revenue = items.reduce(
          (sum, item) => sum + (item.revenue || 0),
          0
        );
        const profit = revenue - cost;

        setFinanceStats([
          { name: "Total Cost", value: cost },
          { name: "Expected Revenue", value: revenue },
          { name: "Expected Profit", value: profit },
        ]);
      } catch (err) {
        console.error("Error loading finance stats", err);
      }
    };

    fetchFinanceData();
  }, []);

  useEffect(() => {
    fetchVehicleList().then((res) => {
      const all: VehicleItem[] = res.data.data;
      const pending = all.filter((v) => !v.isDone);
      setVehicleQueue(pending);
      setCurrentPage(1);
    });
  }, []);

  const handleMarkDone = async (id: string, model: string) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/vehicles/mark-done/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVehicleQueue((prev) => prev.filter((v) => v._id !== id));
      toast.success(`${model} marked as repaired`);
    } catch (err) {
      toast.error("Failed to mark as done");
      console.error("Axios error:", err);
    }
  };

  useEffect(() => {
    fetchAllQuotations().then((res) => {
      const quotes = res.data.data as { problemDescription?: string }[];
      const countByService: Record<string, number> = {};
      quotes.forEach((q) => {
        const name = q.problemDescription || "Other";
        countByService[name] = (countByService[name] || 0) + 1;
      });

      const chartData: ServiceStat[] = Object.entries(countByService)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopServices(chartData);
    });
  }, []);

  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = vehicleQueue.slice(
    indexOfFirstVehicle,
    indexOfLastVehicle
  );
  const totalPages = Math.ceil(vehicleQueue.length / vehiclesPerPage);

  return (
    <>
      <Typography
        variant="h4"
        className="mb-6 font-bold text-center text-black "
      >
        Admin Dashboard
      </Typography>
      <Box className="p-6 mx-auto max-w-8xl">
        <ToastContainer position="top-right" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Inventory Bar Chart */}
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4 font-semibold">
              Inventory Quantities (Purchased vs Sold)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={inventoryStats}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalPurchased" name="Purchased" fill="#2a5c97" />
                <Bar dataKey="totalSold" name="Sold" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Financial Pie Chart */}
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4 font-semibold">
              Financial Overview (Cost vs Revenue vs Profit)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financeStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) =>
                    `${name}: MWK ${value.toLocaleString("en-MW")}`
                  }
                  dataKey="value"
                >
                  {financeStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `MWK ${value.toLocaleString("en-MW")}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>

          {/* Vehicle queue */}
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4 font-semibold">
              Vehicle Queue (Live Log)
            </Typography>

            <ul className="space-y-2">
              {currentVehicles.map((v: VehicleItem, index: number) => {
                const createdAt = new Date(v.createdAt);
                const now = new Date();
                const daysInGarage = Math.floor(
                  (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <li
                    key={index}
                    className="flex justify-between p-2 border rounded shadow-sm"
                  >
                    <div>
                      {v.plateNumber} - {v.model}
                      <span className="ml-2 text-sm text-gray-500">
                        ({createdAt.toLocaleString()}) —{" "}
                        <strong>{daysInGarage} day(s)</strong> in garage
                      </span>
                    </div>
                    <button
                      onClick={() => handleMarkDone(v._id, v.model)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Mark Done
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </Paper>

          {/* Top quoted services */}
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4 font-semibold">
              Top Quoted Services (Bar Chart)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topServices}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </div>

        <Divider className="my-6" />
      </Box>
    </>
  );
};

export default Dashboard;
