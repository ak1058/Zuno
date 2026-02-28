"use client";

import { useTheme } from "@/app/providers/theme-provider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "day":
        return "☀️";
      case "night":
        return "🌙";
      case "grayscale":
        return "⚫";
      default:
        return "🎨";
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "day":
        return "Light";
      case "night":
        return "Dark";
      case "grayscale":
        return "Grayscale";
      default:
        return "Theme";
    }
  };

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg border border-white/10 bg-white/5"
        aria-label="Theme toggle"
      >
        <span className="w-5 h-5 block"></span>
      </button>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        aria-label={`Switch theme. Current: ${getThemeLabel()}`}
        title={`Current: ${getThemeLabel()}. Click to switch to ${
          themes[(themes.indexOf(theme) + 1) % themes.length]
        }`}
      >
        <span className="text-lg">{getThemeIcon()}</span>
        <span className="text-sm hidden sm:inline">{getThemeLabel()}</span>
        <svg
          className="w-4 h-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Theme dropdown */}
      <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 backdrop-blur-xl z-50">
        <div className="py-2">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 ${
                theme === t ? "bg-white/10" : ""
              }`}
            >
              <span className="text-lg">
                {t === "day" ? "☀️" : t === "night" ? "🌙" : "⚫"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium capitalize">{t}</p>
                <p className="text-xs text-zinc-400">
                  {t === "day" ? "Light theme" : 
                   t === "night" ? "Dark theme" : 
                   "Black & white"}
                </p>
              </div>
              {theme === t && (
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}