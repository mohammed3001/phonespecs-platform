"use client";

import { useTheme } from "./ThemeProvider";
import { Icon } from "./Icon";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${
        theme === "dark"
          ? "text-yellow-400 hover:bg-gray-700"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
      } ${className}`}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Icon
        icon={theme === "dark" ? "mdi:weather-sunny" : "mdi:weather-night"}
        width={20}
      />
    </button>
  );
}
