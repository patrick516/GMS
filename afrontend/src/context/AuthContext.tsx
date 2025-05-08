import { createContext } from "react";

interface AuthContextType {
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
  setUser: (
    user: { id: string; username: string; email: string } | null
  ) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
