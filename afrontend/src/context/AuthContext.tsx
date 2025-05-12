import { createContext } from "react";

interface AuthContextType {
  user: {
    id: string;
    username: string;
    email: string;
    role: "admin" | "staff";
  } | null;

  setUser: (
    user: {
      id: string;
      username: string;
      email: string;
      role: "admin" | "staff";
    } | null
  ) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
