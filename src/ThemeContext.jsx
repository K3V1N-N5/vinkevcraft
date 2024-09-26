// ThemeContext.js
import { createContext, useState, useEffect, useContext } from 'react';

// Membuat context untuk tema
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    // Cek preferensi tema dari localStorage atau default ke true (dark mode)
    if (typeof window !== "undefined" && window.localStorage) {
      const storedPrefs = window.localStorage.getItem("isDarkMode");
      if (typeof storedPrefs === "string") {
        return JSON.parse(storedPrefs);
      }
    }
    // Jika tidak ada preferensi, default ke dark mode
    return true;
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(isDarkMode ? 'dark' : 'light');
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
