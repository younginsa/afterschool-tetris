"use client";

import type { ReactNode } from "react";

interface ChipProps {
  selected?: boolean;
  variant?: "blue" | "green";
  onClick?: () => void;
  children: ReactNode;
}

export function Chip({
  selected = false,
  variant = "blue",
  onClick,
  children,
}: ChipProps) {
  const base =
    "rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-colors";

  const colors = selected
    ? variant === "green"
      ? "border-toss-success bg-toss-success-tint text-toss-success-dark"
      : "border-toss-blue bg-toss-blue-tint text-toss-blue"
    : "border-toss-border-2 bg-white text-toss-muted";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${colors} active:scale-[0.97]`}
    >
      {children}
    </button>
  );
}
