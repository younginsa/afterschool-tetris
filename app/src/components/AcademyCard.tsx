"use client";

import Link from "next/link";
import type { Academy, Day } from "@/lib/types";
import { DAY_LABEL } from "@/lib/types";
import { groupSlotsByTime } from "@/lib/scoring";
import { Tag } from "./Tag";
import { FitBadge } from "./FitBadge";
import { Pill } from "./Pill";

interface AcademyCardProps {
  academy: Academy;
  computedFit?: number;
  banner?: { tone: "ok" | "warn"; text: string };
  distanceHint?: string;
}

function daysToLabel(days: Day[]): string {
  // Keep the canonical Mon→Fri order
  const order: Day[] = ["mon", "tue", "wed", "thu", "fri"];
  return order
    .filter((d) => days.includes(d))
    .map((d) => DAY_LABEL[d])
    .join("·");
}

export function AcademyCard({
  academy,
  computedFit,
  banner,
  distanceHint,
}: AcademyCardProps) {
  const fit = computedFit ?? academy.fitScore;
  const groups = groupSlotsByTime(academy);
  const top3 = groups.slice(0, 3);

  const subjectVariant = academy.subjects[0];

  return (
    <Link
      href={`/slot/${academy.id}`}
      className="block cursor-pointer rounded-2xl border border-toss-border bg-white p-4 transition-transform active:scale-[0.98] mx-[14px] mb-[10px]"
    >
      <div>
        <Tag variant={subjectVariant}>
          {subjectVariant === "english"
            ? "영어"
            : subjectVariant === "math"
              ? "수학"
              : subjectVariant === "taekwondo"
                ? "태권도"
                : subjectVariant === "art"
                  ? "미술"
                  : "기타"}
        </Tag>
        {academy.shuttleAvailable ? <Tag variant="shuttle">🚌 셔틀</Tag> : null}
      </div>

      <div className="mb-[9px] flex items-start justify-between">
        <div>
          <div className="text-[15px] font-extrabold text-toss-text">
            {academy.name}
          </div>
          <div className="mt-[2px] text-[11px] text-toss-muted">
            {academy.address}
            {distanceHint ? ` · ${distanceHint}` : ""} · {academy.distanceKm}km
            {!academy.shuttleAvailable ? " · 셔틀없음" : ""}
          </div>
        </div>
        <FitBadge score={fit} />
      </div>

      {banner ? (
        <div
          className={`mb-[9px] rounded-lg px-[10px] py-[7px] text-[11px] font-bold ${
            banner.tone === "ok"
              ? "bg-toss-success-tint-2 text-toss-success-dark"
              : "bg-toss-warn-tint-2 text-toss-warn-dark"
          }`}
        >
          {banner.tone === "ok" ? "✓ " : "⚠️ "}
          {banner.text}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-[5px]">
        {top3.map((g) => {
          const dayLabel = daysToLabel(g.days);
          if (!g.available) {
            return (
              <Pill key={`${g.startTime}-${g.endTime}`} variant="full">
                {dayLabel} {g.startTime} (만석)
              </Pill>
            );
          }
          // Mix between open and avail to match the mockup's visual variety
          const variant = top3.indexOf(g) === 0 ? "open" : "avail";
          return (
            <Pill key={`${g.startTime}-${g.endTime}`} variant={variant}>
              {dayLabel} {g.startTime}
              {variant === "open" ? " ✓" : ""}
            </Pill>
          );
        })}
      </div>
    </Link>
  );
}
