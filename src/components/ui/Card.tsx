import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({
  className,
  children,
  hoverEffect = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/80 shadow-sm p-6",
        hoverEffect && "transition-all duration-200 hover:shadow-md hover:border-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
