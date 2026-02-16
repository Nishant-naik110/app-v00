"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Create a context for theme management
interface ThemeContextProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Initialize context with default values - default to dark mode
const ThemeContext = createContext<ThemeContextProps>({
  isDarkMode: true,
  toggleTheme: () => {},
});

// Theme provider component to wrap around the app
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default to dark mode
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Ensure dark class is applied on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Toggle between dark and light mode (no localStorage - resets to dark on refresh)
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use the ThemeContext in components
export function useTheme() {
  return useContext(ThemeContext);
}
