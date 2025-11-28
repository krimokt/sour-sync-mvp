import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export const ThemeToggleButton: React.FC = () => {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#0f7aff] hover:border-[#0f7aff]/30 dark:hover:text-[#0f7aff] dark:hover:border-[#0f7aff]/30 shadow-sm"
      aria-label="Toggle Theme"
    >
      <Sun className="w-5 h-5 hidden dark:block transition-transform duration-200 rotate-0 dark:rotate-0" />
      <Moon className="w-5 h-5 dark:hidden transition-transform duration-200 rotate-0 dark:-rotate-90" />
    </button>
  );
};
