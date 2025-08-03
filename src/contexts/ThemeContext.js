import React, { createContext, useState, useEffect } from 'react';

// Create the ThemeContext
export const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {}
});

// Create ThemeProvider component
export const ThemeProvider = ({ children }) => {
  // Default to dark mode for our design
  const [isDark, setIsDark] = useState(true);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Effect to apply dark mode class to body
  useEffect(() => {
    document.body.classList.add('dark-mode');
    
    // Apply dark mode to root element
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 