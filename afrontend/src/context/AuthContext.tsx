import { createContext } from "react";

interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "staff";
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
