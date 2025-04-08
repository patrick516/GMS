import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Employee {
  id: number;
  fullName: string;
  position: string;
  salary: number;
}

interface Payslip extends Employee {
  daysAbsent: number;
  tax: number;
  allowances: number;
  otherDeductions: number;
  netPay: number;
  dateProcessed: string;
}

const Accounts = () => {
  const [payQueue, setPayQueue] = useState<Employee[]>([]);
  const [completedPayslips, setCompletedPayslips] = useState<Payslip[]>([]);
  const [formData, setFormData] = useState<Record<number, Partial<Payslip>>>(
    {}
  );

  useEffect(() => {
    // TODO: Replace with API call to fetch employees
    const fetchedEmployees: Employee[] = [
      { id: 1, fullName: "John Banda", position: "Mechanic", salary: 120000 },
      {
        id: 2,
        fullName: "Jane Phiri",
        position: "Receptionist",
        salary: 95000,
      },
      { id: 3, fullName: "James Mwale", position: "Cleaner", salary: 300000 },
    ];
    setPayQueue(fetchedEmployees);
  }, []);

  const calculateTax = (salary: number): number => {
    if (salary <= 100000) return 0;
    if (salary <= 1000000) return (salary - 100000) * 0.25;
    return 900000 * 0.25 + (salary - 1000000) * 0.3;
  };

  const handleChange = (id: number, field: keyof Payslip, value: number) => {
    setFormData((prev) => {
      const updated = {
        ...prev[id],
        [field]: value,
      };

      // Auto-calculate netPay
      const emp = payQueue.find((e) => e.id === id);
      if (!emp) return prev;

      const perDayRate = emp.salary / 30;
      const daysAbsent = updated.daysAbsent || 0;
      const tax = calculateTax(emp.salary);
      const allowances = updated.allowances || 0;
      const otherDeductions = updated.otherDeductions || 0;

      const netPay =
        emp.salary -
        daysAbsent * perDayRate -
        tax -
        otherDeductions +
        allowances;

      return {
        ...prev,
        [id]: {
          ...updated,
          tax,
          netPay,
        },
      };
    });
  };

  const handleMarkAsPaid = (emp: Employee) => {
    const data = formData[emp.id] || {};
    const payslip: Payslip = {
      ...emp,
      daysAbsent: data.daysAbsent || 0,
      tax: data.tax || 0,
      allowances: data.allowances || 0,
      otherDeductions: data.otherDeductions || 0,
      netPay: data.netPay || emp.salary,
      dateProcessed: new Date().toLocaleString(),
    };
    setCompletedPayslips((prev) => [...prev, payslip]);
    setPayQueue((prev) => prev.filter((e) => e.id !== emp.id));
    toast.success(`Payslip processed for ${emp.fullName}`);
  };

  const handleExportExcel = () => {
    const data = completedPayslips.map((p) => ({
      Name: p.fullName,
      Position: p.position,
      Salary: p.salary,
      DaysAbsent: p.daysAbsent,
      Tax: p.tax,
      Allowances: p.allowances,
      OtherDeductions: p.otherDeductions,
      NetPay: p.netPay,
      Date: p.dateProcessed,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payslips");
    XLSX.writeFile(workbook, "Payslips.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const img = new Image();
    img.src = "/logos/uas-motors-logo.png";

    img.onload = () => {
      doc.addImage(img, "PNG", 10, 10, 30, 30);
      doc.setFontSize(16);
      doc.text("Garage Inventory Data Management System", 45, 25);

      autoTable(doc, {
        startY: 50,
        head: [
          [
            "Name",
            "Position",
            "Salary",
            "Absent",
            "Tax",
            "Allowances",
            "Deductions",
            "Net Pay",
            "Date",
          ],
        ],
        body: completedPayslips.map((p) => [
          p.fullName,
          p.position,
          p.salary,
          p.daysAbsent,
          p.tax,
          p.allowances,
          p.otherDeductions,
          p.netPay,
          p.dateProcessed,
        ]),
      });

      doc.save("Payslips.pdf");
    };
  };

  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Name", flex: 1 },
    { field: "position", headerName: "Position", flex: 1 },
    { field: "salary", headerName: "Salary (MWK)", width: 130 },
    { field: "daysAbsent", headerName: "Absent Days", width: 130 },
    { field: "tax", headerName: "Tax (MWK)", width: 130 },
    { field: "allowances", headerName: "Allowances (MWK)", width: 150 },
    { field: "otherDeductions", headerName: "Other Deductions", width: 160 },
    { field: "netPay", headerName: "Net Pay (MWK)", width: 150 },
    { field: "dateProcessed", headerName: "Processed On", flex: 1 },
  ];

  return (
    <Box className="max-w-7xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black">
      <Typography
        variant="h4"
        className="text-center mb-6 font-bold text-gray-800"
      >
        Payslip Processing
      </Typography>

      <Typography variant="h6" className="mb-4 text-gray-700">
        Employees Pending Payslip
      </Typography>

      {payQueue.slice(0, 2).map((emp) => {
        const data = formData[emp.id] || {};
        return (
          <Box key={emp.id} className="border p-4 rounded-lg mb-4 bg-gray-50">
            <Typography className="mb-2 font-semibold">
              {emp.fullName} ({emp.position})
            </Typography>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <TextField
                label="Absent Days"
                type="number"
                onChange={(e) =>
                  handleChange(emp.id, "daysAbsent", parseFloat(e.target.value))
                }
                fullWidth
              />
              <TextField
                label="Allowances (MWK)"
                type="number"
                onChange={(e) =>
                  handleChange(emp.id, "allowances", parseFloat(e.target.value))
                }
                fullWidth
              />
              <TextField
                label="Other Deductions (MWK)"
                type="number"
                onChange={(e) =>
                  handleChange(
                    emp.id,
                    "otherDeductions",
                    parseFloat(e.target.value)
                  )
                }
                fullWidth
              />
              <TextField
                label="Auto Calculated Tax (MWK)"
                value={calculateTax(emp.salary).toFixed(2)}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Net Pay Preview"
                value={(data.netPay || emp.salary).toFixed(2)}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </div>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleMarkAsPaid(emp)}
            >
              Mark as Done
            </Button>
          </Box>
        );
      })}

      <Typography variant="h6" className="mt-8 mb-4 text-gray-700">
        Completed Payslips
      </Typography>

      <div className="flex gap-4 justify-end mb-4">
        <Button variant="outlined" color="primary" onClick={handleExportExcel}>
          Export to Excel
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleExportPDF}>
          Export to PDF
        </Button>
      </div>

      <div
        style={{
          height: completedPayslips.length > 0 ? 500 : 100,
          width: "100%",
        }}
      >
        <DataGrid
          rows={completedPayslips.map((p, i) => ({ id: i + 1, ...p }))}
          columns={columns}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
        />
      </div>
    </Box>
  );
};

export default Accounts;
