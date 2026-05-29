"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Academy, Day, Slot } from "@/lib/types";
import { DAYS, DAY_LABEL, SUBJECT_LABEL } from "@/lib/types";
import { StatusBar } from "@/components/StatusBar";
import { NavHeader } from "@/components/NavHeader";
import { Tag } from "@/components/Tag";
import { CtaBar } from "@/components/CtaBar";
import { useAppStore } from "@/lib/store";
import {
  formatKRW,
  parseMinutes,
  DEFAULT_DISMISSAL,
} from "@/lib/scoring";
import academies from "@data/academies.json";

const TIME_ROWS = ["14:00", "15:00", "16:00", "17:00", "18:00"] as const;

interface SlotClientProps {
  academy: Academy;
}

type CellState = "taken" | "empty" | "selected";

export function SlotClient({ academy }: SlotClientProps) {
  const router = useRouter();
  const { toggleSlot, isSlotSelected, selectionsForAcademy } = useAppStore();

  const selectedSlots = selectionsForAcademy(academy.id);

  const slotByDayHour = useMemo(() => {
    const map = new Map<string, Slot>();
    for (const s of academy.slots) {
      const hourBucket = s.startTime.slice(0, 2) + ":00";
      map.set(`${s.day}|${hourBucket}`, s);
    }
    return map;
  }, [academy.slots]);

  const computeCellState = (day: Day, time: string): CellState => {
    const slot = slotByDayHour.get(`${day}|${time}`);
    if (!slot) return "taken";
    if (!slot.available) return "taken";
    if (
      isSlotSelected(academy.id, {
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })
    )
      return "selected";
    return "empty";
  };

  const onCellClick = (day: Day, time: string) => {
    const slot = slotByDayHour.get(`${day}|${time}`);
    if (!slot || !slot.available) return;
    toggleSlot(academy.id, {
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  // Selection summary
  const summary = useMemo(() => {
    if (selectedSlots.length === 0) return null;
    const days = DAYS.filter((d) =>
      selectedSlots.some((s) => s.day === d),
    ).map((d) => DAY_LABEL[d]);
    const startTime = selectedSlots[0].startTime;
    const endTime = selectedSlots[0].endTime;
    const sessionsPerMonth = selectedSlots.length * 4;
    const dismissal = parseMinutes(DEFAULT_DISMISSAL);
    const firstStart = parseMinutes(startTime);
    const margin = firstStart - dismissal;
    return {
      days: days.join("·"),
      startTime,
      endTime,
      sessionsPerWeek: selectedSlots.length,
      sessionsPerMonth,
      margin,
      monthlyCost: academy.monthlyCostKRW,
      arrivalTime: minutesPlus(endTime, 10),
    };
  }, [selectedSlots, academy.monthlyCostKRW]);

  // Combo suggestion: pick a top-ranked academy from a different subject
  const combo = useMemo(() => {
    const mySubjects = new Set(academy.subjects);
    const others = (academies as Academy[])
      .filter((a) => a.id !== academy.id)
      .filter((a) => !a.subjects.some((s) => mySubjects.has(s)))
      .sort((a, b) => b.fitScore - a.fitScore);
    return others[0] ?? null;
  }, [academy]);

  const onContinue = () => {
    if (selectedSlots.length === 0) return;
    router.push("/schedule");
  };

  return (
    <>
      <StatusBar />
      <NavHeader title="시간표 선택" backHref="/results" />

      <div className="flex-1 overflow-y-auto pb-2">
        {/* Academy header */}
        <div className="border-b border-toss-border bg-white px-[18px] py-4">
          <div className="flex items-center gap-[14px]">
            <div className="flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-2xl bg-toss-blue-tint text-[28px]">
              {academy.emoji ?? "📚"}
            </div>
            <div>
              <div className="text-[17px] font-black text-toss-text">
                {academy.name}
              </div>
              <div className="mt-[2px] text-[12px] text-toss-muted">
                {academy.address} · {academy.distanceKm}km
              </div>
              <div className="mt-2">
                {academy.subjects.map((s) => (
                  <Tag key={s} variant={s}>
                    {SUBJECT_LABEL[s]}
                  </Tag>
                ))}
                {academy.shuttleAvailable && <Tag variant="shuttle">🚌 셔틀</Tag>}
                <Tag variant="ok">{academy.fitScore}% 적합</Tag>
              </div>
            </div>
          </div>
        </div>

        {/* Tetris grid */}
        <div className="px-[14px] pt-4 pb-2">
          <div className="mb-[3px] text-[13px] font-extrabold text-toss-text">
            주간 시간표 선택
          </div>
          <div className="mb-3 text-[11px] text-toss-muted">
            빈 슬롯을 눌러 원하는 수업 시간을 선택하세요
          </div>

          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: "46px repeat(5, 1fr)" }}
          >
            {/* Headers */}
            <div />
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-[6px] text-center text-[11px] font-extrabold text-toss-muted"
              >
                {DAY_LABEL[d]}
              </div>
            ))}

            {/* Body */}
            {TIME_ROWS.map((time) => {
              const isHi = time === "16:00";
              return (
                <RowFragment
                  key={time}
                  time={time}
                  isHi={isHi}
                  cells={DAYS.map((day) => ({
                    day,
                    state: computeCellState(day, time),
                    onClick: () => onCellClick(day, time),
                  }))}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="px-[14px] pb-[14px]">
          <div className="flex flex-wrap gap-3">
            <LegendItem color="bg-toss-blue" label="선택됨" />
            <LegendItem
              color="bg-toss-bg border-[1.5px] border-toss-border-2"
              label="비어있음"
            />
            <LegendItem color="bg-toss-disabled-bg" label="만석" />
          </div>
        </div>

        {/* Selection summary */}
        {summary ? (
          <div className="mx-[14px] rounded-2xl border border-toss-blue-border bg-toss-blue-tint p-[14px]">
            <div className="mb-[5px] text-[13px] font-extrabold text-toss-blue-hover">
              선택: {summary.days} {summary.startTime} – {summary.endTime}
            </div>
            <div className="text-[11px] leading-[1.8] text-toss-blue">
              {summary.margin >= 15 && summary.margin <= 60 ? (
                <>
                  ✓ 하교 후 충분한 여유 있음 ({summary.margin}분)
                  <br />
                </>
              ) : summary.margin < 15 ? (
                <>
                  ⚠️ 하교 후 여유 시간 부족 ({summary.margin}분)
                  <br />
                </>
              ) : (
                <>
                  ⚠️ 하교 후 공백 {summary.margin}분 발생
                  <br />
                </>
              )}
              {academy.shuttleAvailable ? (
                <>
                  ✓ 셔틀 {summary.arrivalTime} 귀가
                  <br />
                </>
              ) : (
                <>
                  ⚠️ 셔틀 없음 · 보호자 픽업 필요
                  <br />
                </>
              )}
              ✓ 주 {summary.sessionsPerWeek}회 · 월{" "}
              {formatKRW(summary.monthlyCost)}
            </div>
          </div>
        ) : (
          <div className="mx-[14px] rounded-2xl border border-dashed border-toss-border-2 bg-white p-4 text-center text-[12px] text-toss-muted">
            빈 슬롯을 눌러 원하는 시간을 선택해보세요
          </div>
        )}

        <div className="h-[14px]" />

        {/* Combo suggestion */}
        {combo ? (
          <div className="px-[14px]">
            <div className="mb-[10px] text-[13px] font-extrabold text-toss-text">
              🧩 같이 조합하면 좋은 학원
            </div>
            <a
              href={`/slot/${combo.id}`}
              className="mx-0 flex items-center gap-3 rounded-2xl border border-toss-border bg-white p-[14px]"
            >
              <div className="text-[28px]">{combo.emoji ?? "📚"}</div>
              <div className="flex-1">
                <div className="text-[13px] font-extrabold text-toss-text">
                  {combo.name}
                </div>
                <div className="mt-[2px] text-[11px] text-toss-muted">
                  화·목 17:00 → 겹치는 슬롯 없음
                </div>
              </div>
              <div className="text-center text-[11px] font-extrabold text-toss-success">
                <div className="text-[18px]">✓</div>호환
              </div>
            </a>
          </div>
        ) : null}

        <div className="h-[14px]" />
      </div>

      <CtaBar
        onClick={onContinue}
        disabled={selectedSlots.length === 0}
      >
        내 스케줄에 추가하기 →
      </CtaBar>
    </>
  );
}

function minutesPlus(hhmm: string, add: number): string {
  const m = parseMinutes(hhmm) + add;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

function RowFragment({
  time,
  isHi,
  cells,
}: {
  time: string;
  isHi: boolean;
  cells: Array<{ day: Day; state: CellState; onClick: () => void }>;
}) {
  return (
    <>
      <div
        className={`flex items-center justify-end pr-[6px] text-[10px] ${
          isHi
            ? "font-extrabold text-toss-blue"
            : "font-semibold text-toss-tertiary"
        }`}
      >
        {time}
      </div>
      {cells.map((c) => (
        <Cell key={c.day} state={c.state} onClick={c.onClick} />
      ))}
    </>
  );
}

function Cell({
  state,
  onClick,
}: {
  state: CellState;
  onClick: () => void;
}) {
  const base =
    "h-[38px] rounded-lg border-[1.5px] flex items-center justify-center text-[8px] font-extrabold transition-colors";
  if (state === "taken") {
    return (
      <div
        aria-disabled
        className={`${base} cursor-not-allowed border-toss-border-2 bg-toss-disabled-bg text-toss-tertiary`}
      >
        만석
      </div>
    );
  }
  if (state === "selected") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} cursor-pointer border-toss-blue bg-toss-blue text-white`}
      >
        ✓
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} cursor-pointer border-toss-border-2 bg-toss-bg text-transparent active:border-toss-blue active:bg-toss-blue-tint`}
    />
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[5px] text-[10px] text-toss-muted">
      <span className={`block h-3 w-3 rounded-[3px] ${color}`} />
      {label}
    </div>
  );
}
