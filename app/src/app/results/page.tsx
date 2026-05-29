"use client";

import { useMemo, useState } from "react";
import academies from "@data/academies.json";
import type { Academy } from "@/lib/types";
import { SUBJECT_LABEL } from "@/lib/types";
import { StatusBar } from "@/components/StatusBar";
import { NavHeader } from "@/components/NavHeader";
import { BottomNav } from "@/components/BottomNav";
import { AcademyCard } from "@/components/AcademyCard";
import { ResultsMap } from "@/components/ResultsMap";
import { useAppStore } from "@/lib/store";
import { filterAcademies, sortedByFit } from "@/lib/scoring";

const data = academies as Academy[];

type FilterMode = "all" | "shuttle" | "open";

export default function ResultsPage() {
  const { state } = useAppStore();
  const { constraints } = state;
  const [filter, setFilter] = useState<FilterMode>("all");

  const filtered = useMemo(
    () => filterAcademies(data, constraints),
    [constraints],
  );
  const ranked = useMemo(
    () => sortedByFit(filtered, constraints),
    [filtered, constraints],
  );

  const visible = useMemo(() => {
    if (filter === "shuttle") return ranked.filter((a) => a.shuttleAvailable);
    if (filter === "open")
      return ranked.filter((a) => a.slots.some((s) => s.available));
    return ranked;
  }, [ranked, filter]);

  const shuttleCount = ranked.filter((a) => a.shuttleAvailable).length;
  const openCount = ranked.filter((a) =>
    a.slots.some((s) => s.available),
  ).length;

  const subtitle = `${constraints.subjects.map((s) => SUBJECT_LABEL[s]).join("·")} · ${
    constraints.shuttleRequired ? "셔틀있음" : "셔틀무관"
  } · ${constraints.latestArrivalTime} 이전`;

  return (
    <>
      <StatusBar />
      <NavHeader title="광교 지역 학원" subtitle={subtitle} backHref="/setup" />

      {/* Map */}
      <div className="relative h-[220px] flex-shrink-0 overflow-hidden bg-[#E0E5EC]">
        <ResultsMap academies={ranked} topCount={ranked.length} />
        <div className="absolute left-[10px] right-[10px] top-3 z-10 flex gap-[6px]">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            전체 ({ranked.length})
          </FilterChip>
          <FilterChip
            active={filter === "shuttle"}
            onClick={() => setFilter("shuttle")}
          >
            🚌 셔틀 ({shuttleCount})
          </FilterChip>
          <FilterChip
            active={filter === "open"}
            onClick={() => setFilter("open")}
          >
            빈 슬롯 ({openCount})
          </FilterChip>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[76px]">
        <div className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.05em] text-toss-tertiary">
          적합도 순
        </div>

        {visible.length === 0 ? (
          <div className="mx-[14px] my-6 rounded-2xl border border-toss-border bg-white p-6 text-center">
            <div className="text-[14px] font-bold text-toss-text">
              조건에 맞는 학원이 없어요
            </div>
            <div className="mt-1 text-[12px] text-toss-muted">
              조건을 다시 설정해보세요
            </div>
          </div>
        ) : (
          visible.map((a, i) => (
            <AcademyCard
              key={a.id}
              academy={a}
              computedFit={a.computedFit}
              banner={bannerFor(a, i)}
              distanceHint={distanceHint(a.distanceKm)}
            />
          ))
        )}

        <div className="h-[14px]" />
      </div>

      <BottomNav active="find" />
    </>
  );
}

function bannerFor(
  a: Academy & { computedFit: number },
  i: number,
): { tone: "ok" | "warn"; text: string } | undefined {
  if (i === 0 && a.shuttleAvailable) {
    return {
      tone: "ok",
      text: "셔틀 운행 중 · 월/수/금 16:00 슬롯 여유 있음",
    };
  }
  if (!a.shuttleAvailable) {
    return { tone: "warn", text: "셔틀 없음 · 보호자 픽업 필요" };
  }
  return undefined;
}

function distanceHint(km: number): string {
  if (km <= 0.5) return "도보 5분";
  if (km <= 1) return "도보 12분";
  return "버스 3분";
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-[6px] text-[11px] font-bold shadow-[0_1px_6px_rgba(0,0,0,0.15)] transition-colors ${
        active ? "bg-toss-blue text-white" : "bg-white text-toss-text"
      }`}
    >
      {children}
    </button>
  );
}
