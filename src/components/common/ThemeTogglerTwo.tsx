"use client";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import React from "react";

export default function ThemeTogglerTwo() {
  const { toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="group relative inline-flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 active:scale-95 border border-white/20"
      aria-label="Toggle theme"
    >
      <div className="relative size-6">
        <Sun className="absolute inset-0 h-full w-full rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-white" />
        <Moon className="absolute inset-0 h-full w-full rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-white" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
