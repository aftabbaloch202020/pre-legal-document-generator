import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "navy";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
      navy: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-700 shadow-sm",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-300",
      outline:
        "border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700 focus:ring-slate-400",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-6 py-2.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
