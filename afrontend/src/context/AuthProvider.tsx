import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{
    id: string;
    username: string;
    email: string;
  } | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
