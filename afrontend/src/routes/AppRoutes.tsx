import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@components/ProtectedRoute";
import MainLayout from "@layouts/MainLayout";
// Auth pages
import AuthPage from "@components/constants/pages/AuthPage";
import ForgotPasswordPage from "@components/constants/pages/ForgotPasswordPage";
import ResetPasswordPage from "@components/constants/pages/ResetPasswordPage";

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
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Inventory />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/add"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AddInventory />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/edit"
        element={
          <ProtectedRoute>
            <MainLayout>
              <EditInventory />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/list"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InventoryList />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/stock"
        element={
          <ProtectedRoute>
            <MainLayout>
              <StockLevels />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/damaged"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DamagedItems />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/reorder"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ReorderRequests />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/suppliers"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suppliers />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Users />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/customers/add"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AddCustomer />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/customers/debtors"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DebtorsList />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/employees"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Employees />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/accounts"
        element={
          <ProtectedRoute>
            {" "}
            <MainLayout>
              <Accounts />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Users />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/add"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AddVehicle />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/list"
        element={
          <ProtectedRoute>
            {" "}
            <MainLayout>
              <VehicleList />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/types"
        element={
          <ProtectedRoute>
            {" "}
            <MainLayout>
              <VehicleTypes />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotations/create"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateQuotation />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotations"
        element={
          <ProtectedRoute>
            <MainLayout>
              <QuotationList />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotations/:id"
        element={
          <ProtectedRoute>
            {" "}
            <MainLayout>
              <QuotationDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices/create"
        element={
          <ProtectedRoute>
            {" "}
            <MainLayout>
              <CreateInvoice />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            {" "}
            <MainLayout>
              <InvoiceList />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InvoiceDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            {" "}
            <MainLayout>
              <Reports />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            {" "}
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default AppRoutes;
