import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

function setupAutoTable(jsPDFLib: any) {
  try {
    autoTable(jsPDFLib, {});
    console.log("autoTable registered");
  } catch (err) {
    console.error("Failed to patch autoTable:", err);
  }
}

setupAutoTable(jsPDF);

interface Employee {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  position: string;
  type: string;
  salary: number;
  startDate: string;
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
  const [formData, setFormData] = useState<Record<string, Partial<Payslip>>>(
    {}
  );

  useEffect(() => {
    const fetchEmployeesForCurrentMonth = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const processedRes = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/payslips/processed?month=${month}&year=${year}`
        );
        const processedIds: string[] = processedRes.data.data;

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/employees`
        );
        const unprocessedEmployees = response.data.data.filter(
          (emp: Employee) => !processedIds.includes(emp._id)
        );

        setPayQueue(unprocessedEmployees);

        const payslipsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/payslips/all`
        );
        const data = payslipsRes.data.data.map((p: any) => ({
          ...p,
          fullName: p.employeeId.fullName,
          position: p.employeeId.position,
          salary: p.salary,
          startDate: p.employeeId.startDate,
        }));
        setCompletedPayslips(data);
      } catch (error) {
        console.error("Failed to fetch employees or payslips:", error);
      }
    };
    fetchEmployeesForCurrentMonth();
  }, []);
  const calculateTax = (salary: number): number => {
    if (salary <= 100000) return 0;
    if (salary <= 200000) return (salary - 100000) * 0.1;
    if (salary <= 499000) return (salary - 200000) * 0.15 + 10000;
    return (salary - 499000) * 0.3 + 299000 * 0.2 + 10000;
  };

  const handleChange = (id: string, field: keyof Payslip, value: number) => {
    setFormData((prev) => {
      const updated = {
        ...prev[id],
        [field]: value,
      };

      const emp = payQueue.find((e) => e._id === id);
      if (!emp) return prev;

      const perDayRate = emp.salary / 30;
      const daysAbsent = updated.daysAbsent || 0;
      const tax = calculateTax(emp.salary);
      console.log("CALCULATED TAX:", emp.fullName, tax);

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

  // const fetchCompletedPayslips = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${import.meta.env.VITE_API_URL}/payslips/all`
  //     );
  //     const data = res.data.data.map((p: any) => ({
  //       ...p,
  //       fullName: p.employeeId.fullName,
  //       position: p.employeeId.position,
  //       salary: p.salary,
  //       startDate: p.employeeId.startDate,
  //     }));
  //     setCompletedPayslips(data);
  //   } catch (error) {
  //     console.error(" Failed to load completed payslips:", error);
  //   }
  // };

  const handleMarkAsPaid = async (emp: Employee) => {
    const data = formData[emp._id] || {};
    const payslip: Payslip = {
      ...emp,
      daysAbsent: data.daysAbsent || 0,
      tax: data.tax || 0,
      allowances: data.allowances || 0,
      otherDeductions: data.otherDeductions || 0,
      netPay: data.netPay || emp.salary,
      dateProcessed: new Date().toLocaleString(),
    };

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/payslips/add`, {
        employeeId: emp._id,
        daysAbsent: payslip.daysAbsent,
        tax: payslip.tax,
        allowances: payslip.allowances,
        otherDeductions: payslip.otherDeductions,
        netPay: payslip.netPay,
        salary: payslip.salary,
      });

      setCompletedPayslips((prev) => [...prev, payslip]);
      setPayQueue((prev) => prev.filter((e) => e._id !== emp._id));
      toast.success(`Payslip processed for ${emp.fullName}`);
    } catch (error) {
      console.error("Failed to save payslip:", error);
      toast.error("Could not mark payslip as paid");
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = "/logos/uas-motors-logo.png";

    const renderPDF = () => {
      let x = 10;
      let y = 20;

      completedPayslips.forEach((payslip, index) => {
        if (index % 2 === 0 && index > 0) {
          doc.addPage();
        }

        x = index % 2 === 0 ? 10 : 110;
        y = 20;

        doc.setFontSize(10);
        doc.addImage(logo, "PNG", x, y, 20, 20);
        doc.text("Payslip", x + 25, y + 5);
        doc.setFontSize(8);
        doc.text(
          `Date of Joining: ${new Date(
            payslip.startDate
          ).toLocaleDateString()}`,
          x,
          y + 20
        );
        doc.text(`Pay Period: ${new Date().toLocaleDateString()}`, x, y + 25);
        doc.text(`Worked Days: ${30 - payslip.daysAbsent}`, x, y + 30);
        doc.text(`Employee name: ${payslip.fullName}`, x + 50, y + 20);
        doc.text(`Designation: ${payslip.position}`, x + 50, y + 25);
        doc.text(`Department: Workshop`, x + 50, y + 30);

        autoTable(doc, {
          startY: y + 35,
          margin: { left: x },
          tableWidth: 85,
          head: [["Earnings", "Amount", "Deductions", "Amount"]],
          body: [
            [
              "Basic",
              formatCurrency(payslip.salary),
              "Tax",
              formatCurrency(payslip.tax),
            ],
            [
              "Allowances",
              formatCurrency(payslip.allowances),
              "Other Deductions",
              formatCurrency(payslip.otherDeductions),
            ],
            ["", "", "", ""],
            [
              "Total Earnings",
              formatCurrency(payslip.salary) +
                formatCurrency(payslip.allowances),
              "Total Deductions",
              formatCurrency(payslip.tax) +
                formatCurrency(payslip.otherDeductions),
            ],
            ["Net Pay", formatCurrency(payslip.netPay), "", ""],
          ],
          styles: { fontSize: 7 },
        });

        doc.text("Employer Signature", x, y + 100);
        doc.text("Employee Signature", x + 60, y + 100);
        doc.text("This is system generated payslip", x, y + 110);
      });

      doc.save("Payslips.pdf");
    };

    //  Ensure the logo is fully loaded before rendering the PDF
    if (logo.complete) {
      renderPDF();
    } else {
      logo.onload = renderPDF;
    }
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
        const data = formData[emp._id] || {};
        return (
          <Box key={emp._id} className="border p-4 rounded-lg mb-4 bg-gray-50">
            <Typography className="mb-2 font-semibold">
              {emp.fullName} ({emp.position})
            </Typography>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <TextField
                label="Absent Days"
                type="number"
                onChange={(e) =>
                  handleChange(
                    emp._id,
                    "daysAbsent",
                    parseFloat(e.target.value)
                  )
                }
                fullWidth
              />
              <TextField
                label="Allowances (MWK)"
                type="number"
                onChange={(e) =>
                  handleChange(
                    emp._id,
                    "allowances",
                    parseFloat(e.target.value)
                  )
                }
                fullWidth
              />
              <TextField
                label="Other Deductions (MWK)"
                type="number"
                onChange={(e) =>
                  handleChange(
                    emp._id,
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

      <div className="flex justify-end mb-4">
        <Button variant="outlined" onClick={handleExportPDF}>
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
          pageSizeOptions={[2, 5, 10]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 2 },
            },
          }}
        />
      </div>
    </Box>
  );
};

export default Accounts;
