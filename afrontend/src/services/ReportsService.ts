import axios from "axios";

const BASE = import.meta.env.VITE_API_URL;

export const fetchInventoryReport = () =>
  axios.get(`${BASE}/inventory/report-detailed`);

export const fetchInvoicesSummary = () => axios.get(`${BASE}/invoices/summary`);

export const fetchAllInvoices = () => axios.get(`${BASE}/invoices/all`);

export const fetchQuotationsSummary = () =>
  axios.get(`${BASE}/quotations/summary`);

export const fetchAllQuotations = () =>
  axios.get(`${import.meta.env.VITE_API_URL}/quotations/all`);

export const fetchPayrollMonthly = () => axios.get(`${BASE}/payslips/monthly`);

export const fetchCustomersSummary = () =>
  axios.get(`${BASE}/customers/summary`);

export const fetchFrequentCustomers = () => {
  return axios.get(`${import.meta.env.VITE_API_URL}/customers/frequent`);
};
export const fetchAllCustomers = () =>
  axios.get(`${import.meta.env.VITE_API_URL}/customers`);

export const fetchOverallReport = () => axios.get(`${BASE}/reports/summary`);

export const fetchPayrollTrend = () => axios.get(`${BASE}/payslips/trend`);

export const fetchAllPayslips = () => axios.get(`${BASE}/payslips/all`);
export const fetchDebtors = () => {
  return axios.get(`${import.meta.env.VITE_API_URL}/customers/debtors`);
};

export const fetchVehicleList = () =>
  axios.get(`${import.meta.env.VITE_API_URL}/vehicles/list`);
