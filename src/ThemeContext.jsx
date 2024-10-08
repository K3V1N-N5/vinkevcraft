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
    
    // Set mode dark atau light pada root (html)
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    // Simpan preferensi tema ke localStorage
    window.localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
