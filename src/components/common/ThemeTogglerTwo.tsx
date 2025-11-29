"use client";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import React from "react";

export default function ThemeTogglerTwo() {
  const { toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="group relative inline-flex size-12 items-center justify-center rounded-full bg-white/10 text-gray-700 dark:text-white backdrop-blur-md border border-gray-200/50 dark:border-white/10 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/20 dark:hover:bg-white/20 active:scale-95"
      aria-label="Toggle theme"
    >
      <div className="relative size-6">
        <Sun className="absolute inset-0 h-full w-full rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute inset-0 h-full w-full rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
