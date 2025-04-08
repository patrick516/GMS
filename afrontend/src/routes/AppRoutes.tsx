import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@layouts/MainLayout";

// Main pages
import Dashboard from "@pages/Dashboard";
import Inventory from "@pages/Inventory";
import Users from "@pages/Users";
import Reports from "@pages/Reports";
import Settings from "@pages/Settings";

// Inventory sub-pages
import AddInventory from "@components/features/inventory/pages/AddInventory";
import EditInventory from "@components/features/inventory/pages/EditInventory";
import InventoryList from "@components/features/inventory/pages/InventoryList";
import StockLevels from "@components/features/inventory/pages/StockLevels";
import DamagedItems from "@components/features/inventory/pages/DamagedItems";
import ReorderRequests from "@components/features/inventory/pages/ReorderRequests";
import Suppliers from "@components/features/inventory/pages/Suppliers";

//user components

import Employees from "@components/features/users/pages/Employees";
import Accounts from "@components/features/users/pages/Accounts";
//vehicles part
import AddVehicle from "@components/features/vehicles/pages/AddVehicle";
import VehicleList from "@components/features/vehicles/pages/VehicleList";
import VehicleTypes from "@components/features/vehicles/pages/VehicleTypes";

//quations and invoices
import CreateQuotation from "@components/features/quotations/pages/CreateQuotation";
import QuotationList from "@components/features/quotations/pages/QuotationList";
import QuotationDetails from "@components/features/quotations/pages/QuotationDetails";

import CreateInvoice from "@components/features/invoices/pages/CreateInvoice";
import InvoiceList from "@components/features/invoices/pages/InvoiceList";
import InvoiceDetails from "@components/features/invoices/pages/InvoiceDetails";

import AddCustomer from "@components/features/customers/pages/AddCustomer";
import DebtorsList from "@components/features/customers/pages/DebtorsList";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />

      <Route
        path="/inventory"
        element={
          <MainLayout>
            <Inventory />
          </MainLayout>
        }
      />
      <Route
        path="/inventory/add"
        element={
          <MainLayout>
            <AddInventory />
          </MainLayout>
        }
      />
      <Route
        path="/inventory/edit"
        element={
          <MainLayout>
            <EditInventory />
          </MainLayout>
        }
      />
      <Route
        path="/inventory/list"
        element={
          <MainLayout>
            <InventoryList />
          </MainLayout>
        }
      />
      <Route
        path="/inventory/stock"
        element={
          <MainLayout>
            <StockLevels />
          </MainLayout>
        }
      />
      <Route
        path="/inventory/damaged"
        element={
          <MainLayout>
            <DamagedItems />
          </MainLayout>
        }
      />
      <Route
        path="/inventory/reorder"
        element={
          <MainLayout>
            <ReorderRequests />
          </MainLayout>
        }
      />
      <Route
        path="/inventory/suppliers"
        element={
          <MainLayout>
            <Suppliers />
          </MainLayout>
        }
      />

      <Route
        path="/users"
        element={
          <MainLayout>
            <Users />
          </MainLayout>
        }
      />
      <Route
        path="/users/customers/add"
        element={
          <MainLayout>
            <AddCustomer />
          </MainLayout>
        }
      />

      <Route
        path="/users/customers/debtors"
        element={
          <MainLayout>
            <DebtorsList />
          </MainLayout>
        }
      />

      <Route
        path="/users/employees"
        element={
          <MainLayout>
            <Employees />
          </MainLayout>
        }
      />

      <Route
        path="/users/accounts"
        element={
          <MainLayout>
            <Accounts />
          </MainLayout>
        }
      />
      <Route
        path="/vehicles"
        element={
          <MainLayout>
            <Users />
          </MainLayout>
        }
      />
      <Route
        path="/vehicles/add"
        element={
          <MainLayout>
            <AddVehicle />
          </MainLayout>
        }
      />
      <Route
        path="/vehicles/list"
        element={
          <MainLayout>
            <VehicleList />
          </MainLayout>
        }
      />
      <Route
        path="/vehicles/types"
        element={
          <MainLayout>
            <VehicleTypes />
          </MainLayout>
        }
      />
      <Route
        path="/quotations/create"
        element={
          <MainLayout>
            <CreateQuotation />
          </MainLayout>
        }
      />
      <Route
        path="/quotations"
        element={
          <MainLayout>
            <QuotationList />
          </MainLayout>
        }
      />
      <Route
        path="/quotations/:id"
        element={
          <MainLayout>
            <QuotationDetails />
          </MainLayout>
        }
      />

      <Route
        path="/invoices/create"
        element={
          <MainLayout>
            <CreateInvoice />
          </MainLayout>
        }
      />
      <Route
        path="/invoices"
        element={
          <MainLayout>
            <InvoiceList />
          </MainLayout>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <MainLayout>
            <InvoiceDetails />
          </MainLayout>
        }
      />

      <Route
        path="/reports"
        element={
          <MainLayout>
            <Reports />
          </MainLayout>
        }
      />

      <Route
        path="/settings"
        element={
          <MainLayout>
            <Settings />
          </MainLayout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
