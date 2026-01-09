export const colorSchemes = {
  primary: ["#E3F2FD", "#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5", "#1976D2", "#1565C0", "#0D47A1"],
  secondary: ["#F3E5F5", "#E1BEE7", "#CE93D8", "#BA68C8", "#AB47BC", "#9C27B0", "#8E24AA", "#7B1FA2", "#6A1B9A", "#4A148C"],
  success: ["#E8F5E9", "#C8E6C9", "#A5D6A7", "#81C784", "#66BB6A", "#4CAF50", "#43A047", "#388E3C", "#2E7D32", "#1B5E20"],
  warning: ["#FFF3E0", "#FFE0B2", "#FFCC80", "#FFB74D", "#FFA726", "#FF9800", "#FB8C00", "#F57C00", "#EF6C00", "#E65100"],
  error: ["#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#EF5350", "#F44336", "#E53935", "#D32F2F", "#C62828", "#B71C1C"],
  info: ["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7", "#29B6F6", "#03A9F4", "#039BE5", "#0288D1", "#0277BD", "#01579B"],
};

export const COLORS = {
  text: {
    primary: "#1a1a2e",
    dark: "#1a1a2e",
    light: "#ffffff",
    tertiary: "#6b7280",
    secondary: "#4b5563",
  },
  border: "#e5e7eb",
  accent: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
  },
  background: {
    light: "#ffffff",
    dark: "#1a1a2e",
    card: "#f8fafc",
  },
  bg: {
    primary: "#ffffff",
    secondary: "#f8fafc",
    dark: "#1a1a2e",
  },
};

export type ColorScheme = keyof typeof colorSchemes;
