import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@hooks/useAuth";

interface LogEntry {
  _id: string;
  action: string;
  details: Record<string, any>;
  createdAt: string;
  userId: {
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

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

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

  useEffect(() => {
    fetchLogs();
  }, []);

  if (user.role !== "admin") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-red-600">
          Access Denied — Admins Only
        </h1>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto bg-white shadow rounded-xl max-w-7xl">
      <h1 className="mb-4 text-3xl font-bold text-center">Audit Trail</h1>

      <div className="flex gap-4 mb-4">
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
        <button
          onClick={fetchLogs}
          className="px-4 py-2 text-white bg-blue-700 rounded hover:bg-blue-800"
        >
          Filter
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-500">No audit logs found.</p>
      ) : (
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Details</th>
              <th className="p-2 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-t">
                <td className="p-2">{log.userId.username}</td>
                <td className="p-2">{log.userId.email}</td>
                <td className="p-2">{log.action}</td>
                <td className="p-2 text-xs whitespace-pre-wrap">
                  {(() => {
                    const d = log.details || {};
                    switch (log.action) {
                      case "User Logged In":
                        return `Logged in as ${d.role}`;
                      case "Added Inventory":
                        return `Added ${d.name} (${d.brand}) - Qty: ${d.quantity}`;
                      case "Added Employee":
                        return `Added ${d.fullName}, Position: ${d.position}, Salary: MWK ${d.salary}`;
                      case "Generated Payslip":
                        return `Payslip for employee ID ${d.employeeId} - Net Pay: MWK ${d.netPay}`;
                      case "Created Quotation":
                        return `Quoted ${d.customerName} - MWK ${d.serviceCost}`;
                      case "Created Invoice":
                        return `Invoice for ${d.customerName} - MWK ${d.amount}`;
                      case "Added Supplier":
                        return `Supplier: ${d.name}, Company: ${d.company}`;
                      case "Marked Vehicle as Done":
                        return `Vehicle ${d.plateNumber} marked completed`;
                      case "Added Vehicle":
                        return `Added vehicle ${d.plateNumber} for ${d.customer}`;
                      case "Viewed Debtor List":
                        return `Viewed list of ${d.count} debtors`;
                      default:
                        return Object.entries(d)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ");
                    }
                  })()}
                </td>

                <td className="p-2 text-gray-600">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AuditTrailPage;
