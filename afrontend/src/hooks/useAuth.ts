import { useContext } from "react";
import { AuthContext } from "@context/AuthContext";
interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "staff";
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
