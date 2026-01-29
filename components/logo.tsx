"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const sizes = {
    sm: { container: "w-8 h-8", text: "text-lg", tagline: "text-xs" },
    md: { container: "w-10 h-10", text: "text-xl", tagline: "text-xs" },
    lg: { container: "w-14 h-14", text: "text-2xl", tagline: "text-sm" },
    xl: { container: "w-20 h-20", text: "text-4xl", tagline: "text-base" },
  };

  const currentSize = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Mark - 48 in a circle */}
      <div
        className={cn(
          currentSize.container,
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 shadow-lg"
        )}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20" />
        
        {/* Number 48 */}
        <span className="relative font-black text-white tracking-tight" style={{ fontSize: size === "xl" ? "1.75rem" : size === "lg" ? "1.25rem" : size === "md" ? "1rem" : "0.75rem" }}>
          48
        </span>
        
        {/* Accent corner */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full shadow-md" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              currentSize.text,
              "font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent leading-tight"
            )}
          >
            DCET Coaching
          </span>
          <span className={cn(currentSize.tagline, "text-amber-600 font-medium")}>
            Excellence in Engineering
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-10 h-10 relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 shadow-lg",
        className
      )}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20" />
      <span className="relative font-black text-white text-base tracking-tight">48</span>
      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full shadow-md" />
    </div>
  );
}
