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

const Dashboard = () => {
  const [inventoryStats, setInventoryStats] = useState<any[]>([]);
  const [financeStats, setFinanceStats] = useState<any[]>([]);
  const [vehicleQueue, setVehicleQueue] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);

  const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#aa66cc"];

  // Inventory bar chart data
  useEffect(() => {
    fetchInventoryReport().then((res) => {
      const items = res.data.data;
      const chartData = items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        purchased: item.totalPurchased,
        sold: item.totalSold,
      }));
      setInventoryStats(chartData);
    });
  }, []);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const inventoryRes = await fetchInventoryReport();
        const items = inventoryRes.data.data;

        const cost = items.reduce(
          (sum: number, item: any) => sum + (item.cost || 0),
          0
        );
        const revenue = items.reduce(
          (sum: number, item: any) => sum + (item.revenue || 0),
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
      const all = res.data.data;
      const pending = all.filter((v: any) => !v.isDone);
      setVehicleQueue(pending);
    });
  }, []);

  const handleMarkDone = async (id: string, model: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/vehicles/delete/${id}`
      );

      setVehicleQueue((prev) => prev.filter((v) => v._id !== id));

      toast.success(`${model} marked as repaired and removed from queue`);
    } catch (err) {
      console.error("Failed to mark vehicle as done", err);
      toast.error("Failed to mark as done");
    }
  };

  useEffect(() => {
    fetchAllQuotations().then((res) => {
      const quotes = res.data.data;
      const countByService: Record<string, number> = {};
      quotes.forEach((q: any) => {
        const name = q.problemDescription || "Other";
        countByService[name] = (countByService[name] || 0) + 1;
      });

      const chartData = Object.entries(countByService)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopServices(chartData);
    });
  }, []);

  return (
    <>
      <Typography
        variant="h4"
        className=" font-bold mb-6 text-center text-black"
      >
        Admin Dashboard
      </Typography>
      <Box className="p-6 max-w-8xl mx-auto">
        <ToastContainer position="top-right" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inventory Bar Chart */}
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4 font-semibold">
              Inventory Quantities (Bar Chart)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryStats}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#8884d8" />
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
                  {financeStats.map((entry, index) => (
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
              {vehicleQueue.map((v, index) => {
                const createdAt = new Date(v.createdAt);
                const now = new Date();
                const daysInGarage = Math.floor(
                  (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <li
                    key={index}
                    className="border p-2 rounded shadow-sm flex justify-between"
                  >
                    <div>
                      {v.plateNumber} - {v.model}
                      <span className="text-sm text-gray-500 ml-2">
                        ({createdAt.toLocaleString()}) —{" "}
                        <strong>{daysInGarage} day(s)</strong> in garage
                      </span>
                    </div>
                    <button
                      onClick={() => handleMarkDone(v._id, v.model)}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Mark Done
                    </button>
                  </li>
                );
              })}
            </ul>
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
