import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@layouts/MainLayout";
import Dashboard from "@pages/Dashboard";
import Inventory from "@pages/Inventory";
import Users from "@pages/Users";
import Reports from "@pages/Reports";
import Settings from "@pages/Settings";

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
        path="/users"
        element={
          <MainLayout>
            <Users />
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
