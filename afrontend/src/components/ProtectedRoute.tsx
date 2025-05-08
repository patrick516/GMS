import { Navigate } from "react-router-dom";
import { isTokenExpired } from "@utils/token";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");

  // ✅ Block if token is missing or expired
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
