"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const sizes = {
    sm: { img: 32, text: "text-lg", tagline: "text-xs" },
    md: { img: 40, text: "text-xl", tagline: "text-xs" },
    lg: { img: 56, text: "text-2xl", tagline: "text-sm" },
    xl: { img: 80, text: "text-4xl", tagline: "text-base" },
  };

  const currentSize = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.png"
        alt="Wintrix Academy"
        width={currentSize.img}
        height={currentSize.img}
        className="rounded-lg"
        priority
      />
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              currentSize.text,
              "font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent leading-tight"
            )}
          >
            Wintrix Academy
          </span>
          <span className={cn(currentSize.tagline, "text-stone-500 font-medium")}>
            Guidance. Strategy. Success.
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Wintrix Academy"
      width={40}
      height={40}
      className={cn("rounded-lg", className)}
      priority
    />
  );
}
