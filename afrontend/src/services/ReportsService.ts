import API from "@utils/axios";

const BASE = import.meta.env.VITE_API_URL;

export const fetchInventoryReport = () =>
  API.get(`${BASE}/reports/inventory/report`);

export const fetchInvoicesSummary = () => API.get(`${BASE}/invoices/summary`);

export const fetchAllInvoices = () => API.get(`${BASE}/invoices/all`);

export const fetchQuotationsSummary = () =>
  API.get(`${BASE}/quotations/summary`);

export const fetchAllQuotations = () =>
  API.get(`${import.meta.env.VITE_API_URL}/quotations/all`);

export const fetchPayrollMonthly = () => API.get(`${BASE}/payslips/monthly`);

export const fetchCustomersSummary = () => API.get(`${BASE}/customers/summary`);

export const fetchFrequentCustomers = () => {
  return API.get(`${import.meta.env.VITE_API_URL}/customers/frequent`);
};
export const fetchAllCustomers = () =>
  API.get(`${import.meta.env.VITE_API_URL}/customers`);

export const fetchOverallReport = () => API.get(`${BASE}/reports/summary`);

export const fetchPayrollTrend = () => API.get(`${BASE}/payslips/trend`);

export const fetchAllPayslips = () => API.get(`${BASE}/payslips/all`);
export const fetchDebtors = () => {
  return API.get(`${import.meta.env.VITE_API_URL}/customers/debtors`);
};

export const fetchVehicleList = () =>
  API.get(`${import.meta.env.VITE_API_URL}/vehicles/list`);
