import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", noPadding = false, onClick }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-slate-200",
        className
      )}
      onClick={onClick}
    >
      <div className={noPadding ? "" : "p-5 sm:p-6"}>{children}</div>
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("mb-4", className)}>{children}</div>;

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <h3 className={cn("text-base font-semibold text-slate-900", className)}>{children}</h3>;

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("text-slate-700", className)}>{children}</div>;
