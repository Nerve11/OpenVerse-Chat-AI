import React, { createContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../theme';

// Create the ThemeContext
export const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {}
});

// Create ThemeProvider component
export const ThemeProvider = ({ children }) => {
  // Check for user preference
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDark, setIsDark] = useState(prefersDarkScheme);

  // Set the theme based on isDark state
  const theme = isDark ? { ...darkTheme, isDark: true } : { ...lightTheme, isDark: false };

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Effect to apply dark mode class to body
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 