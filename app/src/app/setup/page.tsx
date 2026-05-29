"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import academies from "@data/academies.json";
import type { Academy, School, Grade, Subject } from "@/lib/types";
import { SUBJECT_LABEL } from "@/lib/types";
import { StatusBar } from "@/components/StatusBar";
import { NavHeader } from "@/components/NavHeader";
import { StepBar } from "@/components/StepBar";
import { Chip } from "@/components/Chip";
import { Toggle } from "@/components/Toggle";
import { CtaBar } from "@/components/CtaBar";
import { useAppStore } from "@/lib/store";
import { filterAcademies } from "@/lib/scoring";

const data = academies as Academy[];

const SCHOOLS: School[] = ["광교초등학교", "신풍초등학교", "영통초등학교"];
const GRADES: Grade[] = [1, 2, 3, 4, 5, 6];
const SUBJECTS: Array<{ id: Subject; emoji: string }> = [
  { id: "english", emoji: "🇺🇸" },
  { id: "math", emoji: "📐" },
  { id: "taekwondo", emoji: "🥋" },
  { id: "art", emoji: "🎨" },
  { id: "piano", emoji: "🎹" },
  { id: "coding", emoji: "💻" },
];

function formatTimeFromValue(v: number): string {
  const h = Math.floor(v);
  const m = v % 1 === 0.5 ? "30" : "00";
  return `${h}:${m}`;
}

function timeToValue(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + (m === 30 ? 0.5 : 0);
}

export default function SetupPage() {
  const router = useRouter();
  const { state, setConstraints, toggleSubject } = useAppStore();
  const { constraints } = state;

  const matchCount = useMemo(
    () => filterAcademies(data, constraints).length,
    [constraints],
  );

  return (
    <>
      <StatusBar />
      <NavHeader
        title="조건 설정"
        subtitle="맞는 학원을 찾아드릴게요"
        backHref="/"
      />
      <StepBar total={4} active={2} />

      <div className="flex-1 overflow-y-auto">
        {/* School */}
        <div className="px-[18px] pt-[18px] pb-[3px] text-[19px] font-black text-toss-text">
          어떤 학교에 다니나요?
        </div>
        <div className="px-[18px] pb-[14px] text-[13px] leading-[1.5] text-toss-muted">
          학교에 따라 하교시간과 셔틀 노선이 달라져요
        </div>
        <div className="px-[18px]">
          <div className="flex flex-wrap gap-[7px]">
            {SCHOOLS.map((school) => (
              <Chip
                key={school}
                selected={constraints.school === school}
                onClick={() => setConstraints({ school })}
              >
                {school}
              </Chip>
            ))}
          </div>
        </div>
        <div className="h-[14px]" />

        {/* Grade */}
        <div className="px-[18px] pb-[10px] text-[13px] font-extrabold text-toss-text">
          학년
        </div>
        <div className="px-[18px]">
          <div className="flex flex-wrap gap-[7px]">
            {GRADES.map((grade) => (
              <Chip
                key={grade}
                selected={constraints.grade === grade}
                onClick={() => setConstraints({ grade })}
              >
                {grade}학년
              </Chip>
            ))}
          </div>
        </div>
        <div className="h-[14px]" />

        {/* Subjects */}
        <div className="px-[18px] pb-[10px] text-[13px] font-extrabold text-toss-text">
          원하는 과목{" "}
          <span className="text-[11px] font-normal text-toss-disabled-fg">
            (복수선택)
          </span>
        </div>
        <div className="px-[18px] pb-[10px] text-[11px] font-semibold text-toss-tertiary">
          3개 이하 권장
        </div>
        <div className="px-[18px]">
          <div className="flex flex-wrap gap-[7px]">
            {SUBJECTS.map(({ id, emoji }) => (
              <Chip
                key={id}
                selected={constraints.subjects.includes(id)}
                variant="green"
                onClick={() => toggleSubject(id)}
              >
                {emoji} {SUBJECT_LABEL[id]}
              </Chip>
            ))}
          </div>
        </div>
        <div className="h-[14px]" />

        {/* Shuttle toggle */}
        <div className="mx-4 flex items-center justify-between rounded-2xl border border-toss-border bg-white px-[18px] py-[14px]">
          <div>
            <div className="text-[14px] font-extrabold text-toss-text">
              🚌 셔틀버스 필수
            </div>
            <div className="mt-[2px] text-[11px] text-toss-muted">
              셔틀 없는 학원은 제외됩니다
            </div>
          </div>
          <Toggle
            on={constraints.shuttleRequired}
            onChange={(on) => setConstraints({ shuttleRequired: on })}
            ariaLabel="셔틀버스 필수"
          />
        </div>
        <div className="h-[14px]" />

        {/* Latest arrival time */}
        <div className="mx-4 rounded-2xl border border-toss-border bg-white p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <div className="text-[13px] font-extrabold text-toss-text">
                최대 귀가 시간
              </div>
              <div className="mt-[2px] text-[11px] text-toss-muted">
                이 시간 이전에 귀가해야 해요
              </div>
            </div>
            <div>
              <span className="text-[26px] font-black text-toss-blue">
                {constraints.latestArrivalTime}
              </span>
              <span className="text-[12px] text-toss-muted"> 까지</span>
            </div>
          </div>
          <input
            type="range"
            min={16}
            max={21}
            step={0.5}
            value={timeToValue(constraints.latestArrivalTime)}
            onChange={(e) =>
              setConstraints({
                latestArrivalTime: formatTimeFromValue(
                  parseFloat(e.target.value),
                ),
              })
            }
          />
          <div className="mt-[6px] flex justify-between text-[10px] text-toss-tertiary">
            <span>16:00</span>
            <span>18:30</span>
            <span>21:00</span>
          </div>
        </div>
        <div className="h-[14px]" />

        {/* Summary */}
        <div className="mx-4 rounded-2xl border border-toss-blue-border bg-toss-blue-tint-2 p-[14px]">
          <div className="mb-[6px] text-[12px] font-extrabold text-toss-en-fg">
            🔍 입력된 조건
          </div>
          <div className="text-[11px] leading-[1.8] text-toss-blue">
            🏫 {constraints.school} {constraints.grade}학년
            <br />
            📚{" "}
            {constraints.subjects.length === 0
              ? "(과목 미선택)"
              : constraints.subjects
                  .map((s) => SUBJECT_LABEL[s])
                  .join(" + ")}
            <br />
            🚌 셔틀 {constraints.shuttleRequired ? "필수" : "선택"}
            <br />
            ⏰ {constraints.latestArrivalTime} 이전 귀가
          </div>
        </div>
        <div className="h-[20px]" />
      </div>

      <CtaBar
        onClick={() => router.push("/results")}
        disabled={constraints.subjects.length === 0}
      >
        학원 찾기 — 조건에 맞는 학원 {matchCount}개 →
      </CtaBar>
    </>
  );
}
