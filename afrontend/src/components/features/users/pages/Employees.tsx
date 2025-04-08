import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography, TextField, MenuItem, Button } from "@mui/material";
import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { toast } from "react-toastify";

const schema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  type: z.enum(["Full-time", "Part-time", "Contract"]),
  salary: z.coerce.number().min(0, "Salary must be a number"),
  allowances: z.coerce.number().optional(),
  deductions: z.coerce.number().optional(),
  startDate: z.string(),
});

type EmployeeForm = z.infer<typeof schema>;

const Employees = () => {
  const [employeeList, setEmployeeList] = useState<EmployeeForm[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      position: "",
      type: "Full-time",
      salary: 0,
      allowances: 0,
      deductions: 0,
      startDate: "",
    },
  });

  const onSubmit = (data: EmployeeForm) => {
    setEmployeeList((prev) => [...prev, data]);
    toast.success("Employee added");
    reset();
  };

  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "position", headerName: "Position", width: 140 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "salary", headerName: "Salary (MWK)", width: 140 },
    { field: "allowances", headerName: "Allowances (MWK)", width: 160 },
    { field: "deductions", headerName: "Deductions (MWK)", width: 160 },
    { field: "startDate", headerName: "Start Date", width: 140 },
  ];

  return (
    <Box className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black">
      <Typography
        variant="h4"
        className="text-center mb-6 font-bold text-gray-800"
      >
        Add Employee
      </Typography>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <TextField
          label="Full Name"
          {...register("fullName")}
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
          fullWidth
        />
        <TextField label="Email" {...register("email")} fullWidth />
        <TextField label="Phone" {...register("phone")} fullWidth />
        <TextField
          label="Position"
          {...register("position")}
          error={!!errors.position}
          helperText={errors.position?.message}
          fullWidth
        />
        <TextField select label="Type" {...register("type")} fullWidth>
          <MenuItem value="Full-time">Full-time</MenuItem>
          <MenuItem value="Part-time">Part-time</MenuItem>
          <MenuItem value="Contract">Contract</MenuItem>
        </TextField>
        <TextField
          label="Salary"
          type="number"
          {...register("salary")}
          error={!!errors.salary}
          helperText={errors.salary?.message}
          fullWidth
        />
        <TextField
          label="Allowances"
          type="number"
          {...register("allowances")}
          fullWidth
        />
        <TextField
          label="Deductions"
          type="number"
          {...register("deductions")}
          fullWidth
        />
        <TextField
          label="Start Date"
          type="date"
          {...register("startDate")}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <div className="md:col-span-2">
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Save Employee
          </Button>
        </div>
      </form>

      <Box className="mt-10">
        <Typography variant="h5" className="mb-4 font-semibold text-gray-800">
          Registered Employees
        </Typography>
        <div
          style={{ height: employeeList.length > 0 ? 500 : 100, width: "100%" }}
        >
          <DataGrid
            rows={employeeList.map((emp, index) => ({ id: index + 1, ...emp }))}
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
    </Box>
  );
};

export default Employees;
