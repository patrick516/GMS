import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useThemeContext } from "../context/ThemeContext";
import { toast } from "react-toastify";
import axios from "axios";

const Settings = () => {
  const { theme, setTheme } = useThemeContext();

  const [tax, setTax] = useState("16");
  const [currency, setCurrency] = useState("MWK");
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["Cash"]);
  const [autoReport, setAutoReport] = useState(true);
  const [whatsAppNotify, setWhatsAppNotify] = useState(true);
  const [quotationMessage, setQuotationMessage] = useState(
    "Hello {{name}}, your quotation is ready."
  );
  const [invoiceReminder, setInvoiceReminder] = useState(
    "Hi {{name}}, please settle your balance of MWK {{amount}}."
  );

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "staff",
  });

  useEffect(() => {
    const stored = localStorage.getItem("garage-settings");
    if (stored) {
      const s = JSON.parse(stored);
      setTax(s.tax);
      setCurrency(s.currency);
      setPaymentMethods(s.paymentMethods);
      setAutoReport(s.autoReport);
      setWhatsAppNotify(s.whatsAppNotify);
      setQuotationMessage(s.quotationMessage);
      setInvoiceReminder(s.invoiceReminder);
      setTheme(s.theme);
    }
  }, [setTheme]);

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          username: `${newUser.firstName} ${newUser.lastName}`.trim(),
          email: newUser.email,
          role: newUser.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("User added successfully!");
      setNewUser({ firstName: "", lastName: "", email: "", role: "staff" });
    } catch (err) {
      console.error("Failed to add user:", err);
      toast.error("Failed to create user");
    }
  };

  const handleSave = () => {
    const settings = {
      tax,
      currency,
      paymentMethods,
      autoReport,
      whatsAppNotify,
      quotationMessage,
      invoiceReminder,
      theme,
    };

    try {
      localStorage.setItem("garage-settings", JSON.stringify(settings));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings.");
      console.error("Save error:", error);
    }
  };

  return (
    <Box className="max-w-4xl p-8 mx-auto mt-10 text-black bg-white shadow-xl rounded-xl">
      <Typography variant="h4" className="mb-8 font-bold text-center">
        System Settings
      </Typography>

      {/* System Settings Form */}
      <Box className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
        <TextField
          label="Default Tax Percentage (%)"
          type="number"
          value={tax}
          onChange={(e) => setTax(e.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Currency</InputLabel>
          <Select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <MenuItem value="MWK">MWK</MenuItem>
            <MenuItem value="ZAR">ZAR</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Payment Methods (comma separated)"
          value={paymentMethods.join(", ")}
          onChange={(e) =>
            setPaymentMethods(e.target.value.split(",").map((m) => m.trim()))
          }
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Theme</InputLabel>
          <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={autoReport}
              onChange={(e) => setAutoReport(e.target.checked)}
            />
          }
          label="Generate report every 30 days"
        />

        <FormControlLabel
          control={
            <Switch
              checked={whatsAppNotify}
              onChange={(e) => setWhatsAppNotify(e.target.checked)}
            />
          }
          label="Enable WhatsApp notifications"
        />

        <TextField
          label="Quotation Message Template"
          value={quotationMessage}
          onChange={(e) => setQuotationMessage(e.target.value)}
          fullWidth
          multiline
          rows={3}
          className="md:col-span-2"
        />

        <TextField
          label="Invoice Reminder Template"
          value={invoiceReminder}
          onChange={(e) => setInvoiceReminder(e.target.value)}
          fullWidth
          multiline
          rows={3}
          className="md:col-span-2"
        />
      </Box>

      {/* Save Button */}
      <Box className="mb-12 text-right">
        <Button
          variant="contained"
          onClick={handleSave}
          className="text-white bg-blue-700 hover:bg-blue-800"
        >
          Save Settings
        </Button>
      </Box>

      {/* Add New User Section */}
      <Box className="p-6 border rounded-lg shadow-sm bg-gray-50">
        <Typography variant="h6" className="mb-4 font-semibold text-gray-800">
          Add New User
        </Typography>

        <Box className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
          <TextField
            label="First Name"
            value={newUser.firstName}
            onChange={(e) =>
              setNewUser({ ...newUser, firstName: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Last Name"
            value={newUser.lastName}
            onChange={(e) =>
              setNewUser({ ...newUser, lastName: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box className="text-right">
          <Button
            variant="contained"
            onClick={handleAddUser}
            className="text-white bg-green-700 hover:bg-green-800"
          >
            Create User
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
