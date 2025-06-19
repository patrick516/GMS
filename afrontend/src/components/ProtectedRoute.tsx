import { Navigate } from "react-router-dom";
import { isTokenExpired } from "@utils/token";
import { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
