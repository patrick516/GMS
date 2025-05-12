import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography, TextField, MenuItem, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  type: z.enum(["Full-time", "Part-time", "Contract"]),
  salary: z.coerce.number().min(0, "Salary must be a number"),
  startDate: z.string(),
});

type EmployeeForm = z.infer<typeof schema>;

const Employees = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [employeeList, setEmployeeList] = useState<EmployeeForm[]>([]);
  const [serverError, setServerError] = useState("");

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
      startDate: "",
    },
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/employees`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setEmployeeList(res.data.data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const onSubmit = async (data: EmployeeForm) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/employees/add`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setServerError("");
      toast.success("Employee saved to system");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employees`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setEmployeeList(response.data.data);
      reset();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to save employee:", error);

        if (error.response?.status === 409) {
          setServerError("Email already in use.");
        } else if (
          error.response?.status === 403 ||
          error.response?.status === 401
        ) {
          setServerError(
            error.response.data.message || "Access denied. Admin only."
          );
        } else if (error.code === "ERR_NETWORK") {
          setServerError("Network error. Please check your connection.");
        } else {
          setServerError("Failed to save employee. Please try again.");
        }
      } else {
        console.error("Unexpected error:", error);
        setServerError("Unexpected error occurred.");
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "position", headerName: "Position", width: 140 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "salary", headerName: "Salary (MWK)", width: 140 },
    { field: "startDate", headerName: "Start Date", width: 140 },
  ];

  return (
    <Box className="max-w-6xl p-8 mx-auto mt-10 text-black bg-white shadow-xl rounded-xl">
      <Typography
        variant="h4"
        className="mb-6 font-bold text-center text-gray-800"
      >
        Add Employee
      </Typography>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
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
          label="Start Date"
          type="date"
          {...register("startDate")}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <div className="flex justify-center md:col-span-2">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="px-8"
          >
            Save Employee
          </Button>
        </div>
      </form>

      <Box className="mt-10">
        {user.role === "admin" && (
          <Button
            variant="contained"
            color="primary"
            style={{ marginBottom: "1rem" }}
            onClick={() => navigate("/users/accounts")}
          >
            Process Payslip
          </Button>
        )}

        <Typography variant="h5" className="mb-4 font-semibold text-gray-800">
          Registered Employees
        </Typography>
        <div
          style={{ height: employeeList.length > 0 ? 500 : 100, width: "100%" }}
        >
          {serverError && (
            <div className="mb-4 font-semibold text-center text-red-600">
              {serverError}
            </div>
          )}

          <DataGrid
            getRowId={(row) => row._id}
            rows={employeeList}
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
