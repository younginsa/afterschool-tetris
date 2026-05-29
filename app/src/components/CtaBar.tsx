"use client";

import type { ReactNode } from "react";

interface CtaBarProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
}

export function CtaBar({
  children,
  variant = "primary",
  onClick,
  disabled,
}: CtaBarProps) {
  const palette =
    variant === "primary"
      ? "bg-toss-blue text-white active:bg-toss-blue-hover"
      : "bg-toss-blue-tint text-toss-blue";

  return (
    <div className="flex-shrink-0 border-t border-toss-border bg-white px-[18px] py-[14px]">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`h-[54px] w-full rounded-2xl text-[16px] font-extrabold transition-transform active:scale-[0.98] disabled:opacity-50 ${palette}`}
      >
        {children}
      </button>
    </div>
  );
}
