"use client";

import { useTheme } from "@/app/providers/theme-provider";

export function useThemeColors() {
  const { theme } = useTheme();
  
  // Define colors for each theme
  const themeColors = {
    day: {
      background: "bg-white",
      text: "text-gray-900",
      border: "border-gray-200",
      primary: "bg-indigo-600",
      primaryText: "text-white",
      card: "bg-gray-50",
    },
    night: {
      background: "bg-black",
      text: "text-white",
      border: "border-white/10",
      primary: "bg-indigo-600",
      primaryText: "text-white",
      card: "bg-white/5",
    },
    grayscale: {
      background: "bg-white",
      text: "text-black",
      border: "border-gray-300",
      primary: "bg-black",
      primaryText: "text-white",
      card: "bg-gray-100",
    },
  };

  return themeColors[theme] || themeColors.night;
}