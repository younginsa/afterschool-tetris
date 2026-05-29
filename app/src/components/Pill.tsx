import type { ReactNode } from "react";

type PillVariant = "open" | "avail" | "full";

const VARIANT_CLASSES: Record<PillVariant, string> = {
  open: "bg-toss-success-tint-3 text-toss-success-deep",
  avail: "bg-toss-en-bg text-toss-en-fg",
  full: "bg-toss-disabled-bg text-toss-disabled-fg line-through",
};

interface PillProps {
  variant: PillVariant;
  children: ReactNode;
}

export function Pill({ variant, children }: PillProps) {
  return (
    <span
      className={`rounded-[7px] px-[10px] py-1 text-[11px] font-bold ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}
