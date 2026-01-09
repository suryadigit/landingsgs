import { useEffect, useMemo } from "react";
import { useMantineColorScheme } from "@mantine/core";
import { COLORS } from "../types/colors";

export const useDarkMode = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setColorScheme(isDarkMode ? 'light' : 'dark');
  const setIsDarkMode = (value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(isDarkMode) : value;
    setColorScheme(newValue ? 'dark' : 'light');
  };

  const dynamicColors = useMemo(() => ({
    ...COLORS,
    text: {
      primary: isDarkMode ? "#ffffff" : "#1a1a2e",
      secondary: isDarkMode ? "#a1a1aa" : "#4b5563",
      tertiary: isDarkMode ? "#71717a" : "#6b7280",
      dark: "#1a1a2e",
      light: "#ffffff",
    },
    border: isDarkMode ? "#373a40" : "#e5e7eb",
    background: {
      light: "#ffffff",
      dark: "#0d0d0d",
      card: isDarkMode ? "#1a1b1e" : "#f8fafc",
    },
    bg: {
      primary: isDarkMode ? "#0d0d0d" : "#ffffff",
      secondary: isDarkMode ? "#1a1b1e" : "#f8fafc",
      tertiary: isDarkMode ? "#2c2e33" : "#f8f9fa",
      dark: "#1a1a2e",
    },
  }), [isDarkMode]);

  return { isDarkMode, isDark: isDarkMode, toggleDarkMode, setIsDarkMode, COLORS: dynamicColors };
};
