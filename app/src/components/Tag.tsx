import type { ReactNode } from "react";
import type { Subject } from "@/lib/types";

type TagVariant =
  | Subject
  | "shuttle"
  | "ok"
  | "warn"
  | "neutral";

const VARIANT_CLASSES: Record<TagVariant, string> = {
  english: "bg-toss-en-bg text-toss-en-fg",
  math: "bg-toss-mt-bg text-toss-mt-fg",
  taekwondo: "bg-toss-tk-bg text-toss-tk-fg",
  art: "bg-toss-ar-bg text-toss-ar-fg",
  piano: "bg-purple-100 text-purple-700",
  coding: "bg-slate-200 text-slate-700",
  shuttle: "bg-toss-success-tint text-toss-success",
  ok: "bg-toss-success-tint-3 text-toss-success-deep",
  warn: "bg-toss-warn-tint-3 text-toss-warn-mid",
  neutral: "bg-toss-disabled-bg text-toss-disabled-fg",
};

interface TagProps {
  variant: TagVariant;
  children: ReactNode;
}

export function Tag({ variant, children }: TagProps) {
  return (
    <span
      className={`mr-1 mb-2 inline-block rounded-md px-[10px] py-[3px] text-[10px] font-extrabold ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}
