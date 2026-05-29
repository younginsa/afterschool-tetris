"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import academies from "@data/academies.json";
import type { Academy, Day, SelectedSlot, Subject } from "@/lib/types";
import { DAYS, DAY_LABEL } from "@/lib/types";
import { StatusBar } from "@/components/StatusBar";
import { NavHeader } from "@/components/NavHeader";
import { BottomNav } from "@/components/BottomNav";
import { useAppStore } from "@/lib/store";
import {
  detectGaps,
  estimateMonthlyCost,
  formatKRW,
  indexSelectionsByDay,
  latestArrival,
  parseMinutes,
  DEFAULT_DISMISSAL,
} from "@/lib/scoring";

const data = academies as Academy[];

const TIMELINE_START_MIN = 14 * 60; // 14:00
const TIMELINE_END_MIN = 19 * 60; // 19:00
const TIMELINE_TOTAL = TIMELINE_END_MIN - TIMELINE_START_MIN; // 300

const SUBJECT_COLOR: Record<Subject, string> = {
  english: "bg-toss-blue",
  math: "bg-amber-500",
  taekwondo: "bg-pink-500",
  art: "bg-emerald-600",
  piano: "bg-purple-500",
  coding: "bg-slate-600",
};

const SUBJECT_LEGEND_LABEL: Record<Subject, string> = {
  english: "영어",
  math: "수학",
  taekwondo: "태권도",
  art: "미술",
  piano: "피아노",
  coding: "코딩",
};

export default function SchedulePage() {
  const router = useRouter();
  const { state, reset } = useAppStore();
  const { selections, constraints } = state;

  const academiesById = useMemo(() => {
    const m = new Map<string, Academy>();
    for (const a of data) m.set(a.id, a);
    return m;
  }, []);

  const byDay = useMemo(() => indexSelectionsByDay(selections), [selections]);

  const selectionsByDayMap = useMemo(() => {
    const m = new Map<Day, SelectedSlot[]>();
    for (const [day, arr] of byDay) {
      m.set(
        day,
        arr.map(({ day, startTime, endTime }) => ({ day, startTime, endTime })),
      );
    }
    return m;
  }, [byDay]);

  const gaps = useMemo(
    () => detectGaps(selectionsByDayMap, DEFAULT_DISMISSAL),
    [selectionsByDayMap],
  );
  const monthlyCost = useMemo(
    () => estimateMonthlyCost(selections, academiesById),
    [selections, academiesById],
  );
  const lastArrival = useMemo(() => latestArrival(selections), [selections]);
  const totalSessions = useMemo(
    () => selections.reduce((acc, s) => acc + s.slots.length, 0),
    [selections],
  );

  // Distinct academies & subjects appearing in selections
  const selectedAcademies = selections
    .map((s) => academiesById.get(s.academyId))
    .filter((a): a is Academy => !!a);
  const subjectsInSchedule = new Set<Subject>();
  for (const a of selectedAcademies) {
    for (const s of a.subjects) subjectsInSchedule.add(s);
  }
  const shuttleAcademies = selectedAcademies.filter((a) => a.shuttleAvailable);

  const hasSelections = selections.length > 0;
  const meetsArrival = lastArrival
    ? parseMinutes(lastArrival) + 15 <=
      parseMinutes(constraints.latestArrivalTime)
    : true;

  const isoMonth = new Date().toISOString().slice(0, 7);
  const monthLabel = `${isoMonth.slice(0, 4)}년 ${parseInt(isoMonth.slice(5), 10)}월`;

  const onReset = () => {
    reset();
    router.push("/setup");
  };

  return (
    <>
      <StatusBar />
      <NavHeader
        title="내 주간 스케줄"
        subtitle={`${monthLabel} · ${constraints.school} ${constraints.grade}학년`}
        backHref="/results"
      />

      <div className="flex-1 overflow-y-auto pb-[76px]">
        {/* Timeline */}
        <div className="mb-[10px] border-b border-toss-border bg-white pt-[14px] pb-[6px]">
          <div className="flex items-center gap-[10px] px-[14px] pb-2 text-[11px] font-extrabold text-toss-muted">
            <span>시간표</span>
            <span className="font-normal text-toss-tertiary">
              14:00 → 19:00
            </span>
          </div>
          {/* Axis */}
          <div className="flex px-[14px] pl-[44px] pr-[14px] pb-1">
            {[14, 15, 16, 17, 18, 19].map((h) => (
              <div
                key={h}
                className="flex-1 text-[9px] font-semibold text-toss-tertiary"
              >
                {h.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {DAYS.map((day) => {
            const slots = byDay.get(day) ?? [];
            const dayGap = gaps.find((g) => g.day === day);
            return (
              <div
                key={day}
                className="flex items-center gap-[10px] px-[14px] py-[6px]"
              >
                <div className="w-5 flex-shrink-0 text-center text-[12px] font-extrabold text-toss-muted">
                  {DAY_LABEL[day]}
                </div>
                <div className="relative h-10 flex-1 overflow-hidden rounded-lg bg-toss-bg">
                  {dayGap ? (
                    <GapBlock
                      startMin={parseMinutes(DEFAULT_DISMISSAL)}
                      endMin={parseMinutes(dayGap.firstSlotStart)}
                    />
                  ) : null}
                  {slots.map((s, i) => (
                    <SlotBlock
                      key={`${s.academyId}-${s.day}-${s.startTime}-${i}`}
                      slot={s}
                      academy={academiesById.get(s.academyId)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="mt-2 flex flex-wrap gap-3 px-[14px] pt-2 pb-[2px]">
            {Array.from(subjectsInSchedule).map((s) => (
              <div
                key={s}
                className="flex items-center gap-[5px] text-[10px] text-toss-muted"
              >
                <span
                  className={`block h-3 w-3 rounded-[3px] ${SUBJECT_COLOR[s]}`}
                />
                {SUBJECT_LEGEND_LABEL[s]}
              </div>
            ))}
            {gaps.length > 0 ? (
              <div className="flex items-center gap-[5px] text-[10px] text-toss-muted">
                <span className="block h-3 w-3 rounded-[3px] border border-dashed border-amber-500 bg-toss-warn-tint" />
                공백
              </div>
            ) : null}
          </div>
        </div>

        {/* Warning banner */}
        {gaps.length > 0 ? (
          <div className="mx-[14px] mb-3 flex items-start gap-[10px] rounded-xl border border-amber-200 bg-toss-warn-tint-2 px-[14px] py-3">
            <div className="flex-shrink-0 text-[18px]">⚠️</div>
            <div className="text-[11px] leading-[1.55] text-toss-warn-dark">
              <div className="mb-[3px] text-[12px] font-extrabold">
                {gaps.map((g) => DAY_LABEL[g.day]).join("·")}요일{" "}
                {gaps[0].gapMinutes}분 공백 발생
              </div>
              {DEFAULT_DISMISSAL} 하교 후 첫 학원 {gaps[0].firstSlotStart}{" "}
              시작까지 빈 시간이 생겨요. 다른 시간 슬롯을 선택하거나 셔틀
              노선을 확인해보세요.
            </div>
          </div>
        ) : null}

        {!hasSelections ? (
          <div className="mx-[14px] my-6 rounded-2xl border border-toss-border bg-white p-6 text-center">
            <div className="text-[14px] font-bold text-toss-text">
              아직 선택한 학원이 없어요
            </div>
            <div className="mt-1 text-[12px] text-toss-muted">
              조건을 설정하고 학원과 시간을 선택해보세요
            </div>
          </div>
        ) : (
          <div className="mx-[14px] rounded-2xl border border-toss-border bg-white p-4">
            <div className="mb-3 text-[14px] font-black text-toss-text">
              스케줄 요약
            </div>
            <SummaryRow
              keyText="📚 선택 학원"
              valueText={`${selectedAcademies.length}곳 (${Array.from(
                subjectsInSchedule,
              )
                .map((s) => SUBJECT_LEGEND_LABEL[s])
                .join(" + ")})`}
            />
            <SummaryRow
              keyText="📅 주간 수업"
              valueText={`주 ${totalSessions}회`}
            />
            <SummaryRow
              keyText="🚌 셔틀 이용"
              valueText={
                shuttleAcademies.length === 0
                  ? "없음"
                  : shuttleAcademies.length === selectedAcademies.length
                    ? "전부 가능"
                    : `${shuttleAcademies.map((a) => a.name.split(" ")[0]).join(", ")}만 가능`
              }
            />
            <SummaryRow
              keyText="🏠 최대 귀가"
              valueText={
                lastArrival
                  ? `${minutesAfter(lastArrival, 15)} ${
                      meetsArrival ? "✓ 목표 달성" : "⚠️ 목표 초과"
                    }`
                  : "—"
              }
              valueClass={meetsArrival ? "text-toss-success" : "text-toss-warn"}
            />
            <div className="mt-1 flex items-center justify-between border-t border-toss-border pt-3 text-[13px]">
              <span className="font-extrabold text-toss-text">
                💰 예상 월 비용
              </span>
              <span className="text-[18px] font-extrabold text-toss-blue">
                {formatKRW(monthlyCost)}
              </span>
            </div>
          </div>
        )}

        <div className="h-[14px]" />

        <button
          type="button"
          className="mx-[14px] flex h-[50px] w-[calc(100%-28px)] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-toss-blue-tint text-[14px] font-extrabold text-toss-blue"
        >
          <span>📤</span> 스케줄 이미지로 공유하기
        </button>

        <div className="px-[14px] pt-[10px]">
          <button
            type="button"
            onClick={onReset}
            className="h-[54px] w-full cursor-pointer rounded-2xl bg-toss-blue-tint text-[16px] font-extrabold text-toss-blue active:scale-[0.98]"
          >
            다시 조건 바꾸기
          </button>
        </div>

        <div className="h-[14px]" />
      </div>

      <BottomNav active="schedule" />
    </>
  );
}

function GapBlock({ startMin, endMin }: { startMin: number; endMin: number }) {
  const left =
    ((Math.max(startMin, TIMELINE_START_MIN) - TIMELINE_START_MIN) /
      TIMELINE_TOTAL) *
    100;
  const width =
    ((Math.min(endMin, TIMELINE_END_MIN) -
      Math.max(startMin, TIMELINE_START_MIN)) /
      TIMELINE_TOTAL) *
    100;
  if (width <= 0) return null;
  return (
    <div
      className="gap-stripe absolute top-1 bottom-1 flex items-center justify-center overflow-hidden whitespace-nowrap rounded-md px-1 text-[8px] font-extrabold text-toss-warn-dark"
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      공백
    </div>
  );
}

function SlotBlock({
  slot,
  academy,
}: {
  slot: SelectedSlot & { academyId: string };
  academy?: Academy;
}) {
  const startMin = parseMinutes(slot.startTime);
  const endMin = parseMinutes(slot.endTime);
  const left =
    ((Math.max(startMin, TIMELINE_START_MIN) - TIMELINE_START_MIN) /
      TIMELINE_TOTAL) *
    100;
  const width =
    ((Math.min(endMin, TIMELINE_END_MIN) -
      Math.max(startMin, TIMELINE_START_MIN)) /
      TIMELINE_TOTAL) *
    100;
  if (width <= 0) return null;
  const subject = academy?.subjects[0] ?? "english";
  return (
    <div
      className={`absolute top-1 bottom-1 flex items-center justify-center overflow-hidden whitespace-nowrap rounded-md px-1 text-[9px] font-extrabold text-white ${SUBJECT_COLOR[subject]}`}
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      {academy?.name ?? "학원"}
    </div>
  );
}

function SummaryRow({
  keyText,
  valueText,
  valueClass,
}: {
  keyText: string;
  valueText: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-toss-border py-[9px] text-[13px] last:border-b-0">
      <span className="text-toss-muted">{keyText}</span>
      <span className={`font-extrabold text-toss-text ${valueClass ?? ""}`}>
        {valueText}
      </span>
    </div>
  );
}

function minutesAfter(hhmm: string, add: number): string {
  const m = parseMinutes(hhmm) + add;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}
