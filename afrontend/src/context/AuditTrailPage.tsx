import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@hooks/useAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { FaRegTrashAlt } from "react-icons/fa";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface LogEntry {
  _id: string;
  action: string;
  details: Record<string, string | number | boolean | null>;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
}

const AuditTrailPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [days, setDays] = useState("30");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [confirmUsername, setConfirmUsername] = useState<string>("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params: Record<string, string> = {};

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      if (!startDate && !endDate && days) {
        const today = new Date();
        const prior = new Date();
        prior.setDate(today.getDate() - Number(days));
        params.startDate = prior.toISOString().split("T")[0];
      }

      const res = await axios.get("http://localhost:5000/api/audit/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      setLogs(res.data.data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Audit Trail Report", 14, 10);
    const rows = logs.map((log) => [
      log.userId.username,
      log.userId.email,
      log.action,
      new Date(log.createdAt).toLocaleString(),
    ]);
    autoTable(doc, {
      head: [["User", "Email", "Action", "Timestamp"]],
      body: rows,
      startY: 20,
    });
    doc.save("audit-trail.pdf");
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(
      logs.map((log) => ({
        user: log.userId.username,
        email: log.userId.email,
        action: log.action,
        timestamp: new Date(log.createdAt).toLocaleString(),
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "audit-trail.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-red-600">
          Access Denied — Admins Only
        </h1>
      </div>
    );
  }

  const groupedLogs = logs.reduce<Record<string, LogEntry[]>>((acc, log) => {
    if (!log.userId || !log.userId._id) return acc;
    const uid = log.userId._id;
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(log);
    return acc;
  }, {});

  return (
    <div className="p-6 mx-auto bg-white shadow rounded-xl max-w-7xl">
      <h1 className="mb-4 text-3xl font-bold text-center">Audit Trail</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="Days"
          className="w-24 px-3 py-2 border rounded"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by user or action"
          className="flex-grow px-3 py-2 border rounded"
        />
        <button
          onClick={fetchLogs}
          className="px-4 py-2 text-white bg-blue-700 rounded hover:bg-blue-800"
        >
          Filter
        </button>
        <button
          onClick={exportToPDF}
          className="px-4 py-2 text-white bg-green-700 rounded hover:bg-green-800"
        >
          Export PDF
        </button>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 text-white bg-yellow-600 rounded hover:bg-yellow-700"
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : Object.keys(groupedLogs).length === 0 ? (
        <p className="text-center text-gray-500">No audit logs found.</p>
      ) : (
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Last Action</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">View</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedLogs)
              .filter(
                ([, entries]) =>
                  entries[0].userId.username
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  entries[0].action
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map(([userId, logs]) => {
                const user = logs[0].userId;
                const last = logs[0];
                return (
                  <>
                    <tr key={userId} className="border-t">
                      <td className="p-2">{user.username}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{last.action}</td>
                      <td className="p-2 text-gray-600">
                        {new Date(last.createdAt).toLocaleString()}
                      </td>
                      <td className="p-2">
                        <button
                          className="text-blue-600 underline hover:text-blue-800"
                          onClick={() =>
                            setExpandedUserId((prev) =>
                              prev === userId ? null : userId
                            )
                          }
                        >
                          {expandedUserId === userId
                            ? "Hide Actions"
                            : "View Actions"}
                        </button>
                      </td>
                    </tr>

                    {expandedUserId === userId && (
                      <tr>
                        <td colSpan={5} className="p-2 bg-gray-50">
                          <table className="w-full text-sm border border-gray-200">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="p-2 text-left">Action</th>
                                <th className="p-2 text-left">Details</th>
                                <th className="p-2 text-left">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {logs.map((log) => (
                                <tr key={log._id}>
                                  <td className="p-2">{log.action}</td>
                                  <td className="p-2 text-xs">
                                    {(() => {
                                      const d = log.details || {};
                                      switch (log.action) {
                                        case "User Logged In":
                                          return `Logged in as ${d.role}`;
                                        case "Added Inventory":
                                          return `Added ${d.name} (${d.brand}) - Qty: ${d.quantity}`;
                                        case "Added Vehicle":
                                          return `Added vehicle ${d.plateNumber} for ${d.customer}`;
                                        case "Created Invoice":
                                          return `Invoice for ${d.customerName} - MWK ${d.amount}`;
                                        default:
                                          return Object.entries(d)
                                            .map(([k, v]) => `${k}: ${v}`)
                                            .join(", ");
                                      }
                                    })()}
                                  </td>
                                  <td className="p-2 text-gray-500">
                                    {new Date(log.createdAt).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => {
                                setConfirmUserId(userId);
                                setConfirmUsername(user.username);
                              }}
                              className="px-4 py-1 mt-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                            >
                              <FaRegTrashAlt /> Clear Actions
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
          </tbody>
        </table>
      )}

      {/* Dialog for confirming deletion */}
      <Dialog open={!!confirmUserId} onClose={() => setConfirmUserId(null)}>
        <DialogTitle>🗑️ Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to <strong>clear all actions</strong> for{" "}
            <span className="font-bold text-blue-600">{confirmUsername}</span>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmUserId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                await axios.delete(
                  `http://localhost:5000/api/audit/logs/${confirmUserId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                setConfirmUserId(null);
                setExpandedUserId(null);
                fetchLogs();
              } catch (err) {
                console.error("Failed to delete logs:", err);
                alert("Failed to clear logs");
              }
            }}
          >
            Yes, Clear
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AuditTrailPage;
