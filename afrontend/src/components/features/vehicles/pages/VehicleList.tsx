import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { toast } from "react-toastify";

interface Vehicle {
  _id: string;
  plateNumber: string;
  model: string;
  brand: string;
  engineNumber: string;
  color: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

const VehicleList = () => {
  const [completedVehicles, setCompletedVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/vehicles/completed`)
      .then((res) => {
        setCompletedVehicles(res.data.data || []);
      })
      .catch((err) => {
        console.error("Error loading completed vehicles:", err);
        toast.error("Failed to load completed vehicles");
      });
  }, []);

  const handleContact = (vehicle: Vehicle) => {
    const message = `Hello ${vehicle.customerName}, your vehicle (${vehicle.plateNumber} - ${vehicle.model}) has been completed. Please pick it up.`;

    // Example: WhatsApp or SMS trigger (pseudo call)
    axios
      .post(`${import.meta.env.VITE_API_URL}/notify`, {
        phone: vehicle.customerPhone,
        message,
      })
      .then(() => toast.success("Customer notified"))
      .catch(() => toast.error("Failed to send notification"));
  };

  return (
    <div className="p-6 mx-auto mt-10 bg-white shadow max-w-7xl rounded-xl">
      <h2 className="mb-6 text-3xl font-bold">Completed Vehicle Repairs</h2>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Customer</th>
            <th className="p-2 text-left">Phone</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Plate Number</th>
            <th className="p-2 text-left">Model</th>
            <th className="p-2 text-left">Completed</th>
            <th className="p-2 text-left">Contact</th>
          </tr>
        </thead>
        <tbody>
          {completedVehicles.map((v) => (
            <tr key={v._id} className="border-t border-gray-200">
              <td className="p-2">{v.customerName}</td>
              <td className="p-2">{v.customerPhone || "N/A"}</td>
              <td className="p-2">{v.customerEmail || "N/A"}</td>
              <td className="p-2">{v.plateNumber}</td>
              <td className="p-2">{v.model}</td>
              <td className="p-2">
                {new Date(v.completedAt || v.createdAt).toLocaleString()}
              </td>
              <td className="p-2">
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => handleContact(v)}
                >
                  Contact
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleList;
