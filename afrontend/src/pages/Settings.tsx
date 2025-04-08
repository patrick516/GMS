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
    <Box className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl text-black">
      <Typography variant="h4" className="text-center font-bold mb-6">
        System Settings
      </Typography>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            fullWidth
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
          <Select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            fullWidth
          >
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
        />

        <TextField
          label="Invoice Reminder Template"
          value={invoiceReminder}
          onChange={(e) => setInvoiceReminder(e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
      </Box>

      <Box className="mt-8 text-center">
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
