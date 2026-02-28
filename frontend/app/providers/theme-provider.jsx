"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "night",
  setTheme: () => null,
  themes: ["day", "night", "grayscale"],
});

export function ThemeProvider({ children, defaultTheme = "night" }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Available themes
  const themes = ["day", "night", "grayscale"];

  // Initialize theme from localStorage or default
  useEffect(() => {
    const storedTheme = localStorage.getItem("zuno-theme");
    if (storedTheme && themes.includes(storedTheme)) {
      setTheme(storedTheme);
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    // Remove all theme classes
    document.documentElement.classList.remove(...themes.map(t => `theme-${t}`));
    
    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Store in localStorage
    localStorage.setItem("zuno-theme", theme);
  }, [theme, mounted]);

  // Handle system preference changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      // Only auto-switch if user hasn't manually set a theme
      const storedTheme = localStorage.getItem("zuno-theme");
      if (!storedTheme) {
        setTheme(mediaQuery.matches ? "night" : "day");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mounted]);

  const value = {
    theme,
    setTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};