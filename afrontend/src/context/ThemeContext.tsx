import { createContext, useState, useContext } from "react";

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div
        className={
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
