import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Additional classes
  type?: "button" | "submit" | "reset"; // Button type
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-[#06b6d4] to-[#0f7aff] text-white shadow-lg hover:shadow-xl hover:from-[#0f7aff] hover:to-[#06b6d4] disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none transition-all",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-[#0f7aff]/10 hover:text-[#0f7aff] hover:ring-[#0f7aff]/30 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-[#0f7aff]/10 dark:hover:text-[#0f7aff] dark:hover:ring-[#0f7aff]/30 transition-all",
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
