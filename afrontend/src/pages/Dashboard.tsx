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

const Dashboard = () => {
  // TODO: Replace with API: /api/inventory/summary
  const [inventoryStats, setInventoryStats] = useState([
    { name: "Oil Filters", quantity: 120 },
    { name: "Brake Pads", quantity: 30 },
    { name: "Spark Plugs", quantity: 7 }, // critical
    { name: "Batteries", quantity: 18 },
  ]);

  // TODO: Replace with API: /api/finance/overview
  const [financeStats, setFinanceStats] = useState([
    { name: "Revenue", value: 1500000 },
    { name: "Cost", value: 950000 },
    { name: "Expected Revenue", value: 400000 },
    { name: "Profit", value: 550000 },
  ]);

  // TODO: Replace with API: /api/vehicles/queue
  const [vehicleQueue, setVehicleQueue] = useState([
    { plate: "BZ 1234", model: "Hilux", time: "10:05 AM" },
    { plate: "MC 7777", model: "Mazda", time: "10:45 AM" },
    { plate: "CP 1111", model: "Corolla", time: "11:10 AM" },
  ]);

  // TODO: Replace with API: /api/quotations/top-services
  const [topServices, setTopServices] = useState([
    { name: "Brake Service", count: 28 },
    { name: "Engine Diagnostics", count: 22 },
    { name: "Oil Change", count: 15 },
    { name: "Suspension Repair", count: 10 },
  ]);

  const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

  return (
    <Box className="p-6 max-w-8xl mx-auto">
      <Typography variant="h4" className="font-bold mb-6">
        Uas Motors GMS Overview
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <Paper className="p-4">
          <Typography variant="h6" className="mb-4 font-semibold">
            Financial Overview (Pie Chart)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={financeStats}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                dataKey="value"
              >
                {financeStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        <Paper className="p-4">
          <Typography variant="h6" className="mb-4 font-semibold">
            Vehicle Queue (Live Log)
          </Typography>
          <ul className="space-y-2">
            {vehicleQueue.map((v, index) => (
              <li key={index} className="border p-2 rounded shadow-sm">
                {v.plate} - {v.model}{" "}
                <span className="text-sm text-gray-500">({v.time})</span>
              </li>
            ))}
          </ul>
        </Paper>

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
  );
};

export default Dashboard;
