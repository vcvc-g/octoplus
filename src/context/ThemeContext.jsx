// src/context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Load theme from localStorage, default to 'light'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved || 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Save theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      // Apply theme class to body
      if (theme === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};