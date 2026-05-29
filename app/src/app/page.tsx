import Link from "next/link";
import academies from "@data/academies.json";
import type { Academy } from "@/lib/types";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { AcademyCard } from "@/components/AcademyCard";

const data = academies as Academy[];

export default function Home() {
  const shuttleCount = data.filter((a) => a.shuttleAvailable).length;
  const recents = data.slice(0, 2);
  const ybm = data.find((a) => a.id === "ybm-gwanggyo");
  const sejung = data.find((a) => a.id === "sejung-math");

  return (
    <>
      <StatusBar />

      {/* Hero */}
      <div className="flex-shrink-0 bg-toss-blue px-5 pt-7 pb-[22px] text-white">
        <div className="mb-1 text-[13px] opacity-80">
          안녕하세요, 김민정 님 👋
        </div>
        <div className="mb-4 text-[22px] font-black leading-[1.3]">
          우리 아이 방과후
          <br />
          일정 맞춰드릴게요
        </div>
        <div className="flex gap-[6px]">
          <div className="rounded-full bg-white/20 px-3 py-[5px] text-[11px] font-bold">
            광교 {data.length}개 학원
          </div>
          <div className="rounded-full bg-white/20 px-3 py-[5px] text-[11px] font-bold">
            🚌 셔틀 {shuttleCount}곳
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[76px]">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-[10px] p-[14px]">
          <Link
            href="/setup"
            className="rounded-2xl border border-toss-border bg-white p-4 transition-transform active:scale-[0.97]"
          >
            <div className="mb-2 text-[26px]">🔍</div>
            <div className="text-[13px] font-extrabold leading-[1.3] text-toss-text">
              조건으로
              <br />
              찾기
            </div>
            <div className="mt-[3px] text-[11px] text-toss-muted">
              셔틀 · 시간 · 과목
            </div>
          </Link>

          <Link
            href="/schedule"
            className="rounded-2xl border border-toss-border bg-white p-4 transition-transform active:scale-[0.97]"
          >
            <div className="mb-2 text-[26px]">📅</div>
            <div className="text-[13px] font-extrabold leading-[1.3] text-toss-text">
              내 주간
              <br />
              스케줄
            </div>
            <div className="mt-[3px] text-[11px] text-toss-muted">
              조합 3개 저장됨
            </div>
          </Link>

          <Link
            href="/results"
            className="rounded-2xl border border-toss-border bg-white p-4 transition-transform active:scale-[0.97]"
          >
            <div className="mb-2 text-[26px]">🗺️</div>
            <div className="text-[13px] font-extrabold leading-[1.3] text-toss-text">
              지도로
              <br />
              탐색
            </div>
            <div className="mt-[3px] text-[11px] text-toss-muted">
              광교 · 영통 · 망포
            </div>
          </Link>

          <div className="rounded-2xl border border-toss-border bg-white p-4">
            <div className="mb-2 text-[26px]">⚡</div>
            <div className="text-[13px] font-extrabold leading-[1.3] text-toss-text">
              빈 슬롯
              <br />
              알림
            </div>
            <div className="mt-[3px] text-[11px] text-toss-muted">
              17시 영어 대기 중
            </div>
          </div>
        </div>

        {/* Recent */}
        <div className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.05em] text-toss-tertiary">
          최근에 본 학원
        </div>

        {recents.map((a) => (
          <AcademyCard key={a.id} academy={a} />
        ))}

        {/* Combo recommendation */}
        <div className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.05em] text-toss-tertiary">
          이번 주 추천 조합
        </div>

        {ybm && sejung ? (
          <div className="mx-[14px] mb-[10px] rounded-2xl border border-toss-border bg-white p-4">
            <div className="mb-[10px] text-[12px] font-extrabold text-toss-blue">
              🧩 조합 추천 — 공백 없음
            </div>
            <div className="mb-2 flex gap-2">
              <div className="flex-1 rounded-[10px] bg-toss-blue-tint p-[10px] text-center">
                <div className="text-[10px] font-bold text-toss-en-fg">
                  YBM 영어
                </div>
                <div className="mt-[2px] text-[11px] font-extrabold text-toss-blue">
                  월·수·금
                  <br />
                  16:00
                </div>
              </div>
              <div className="flex items-center text-[18px]">+</div>
              <div className="flex-1 rounded-[10px] bg-toss-mt-bg p-[10px] text-center">
                <div className="text-[10px] font-bold text-toss-warn-mid">
                  세정 수학
                </div>
                <div className="mt-[2px] text-[11px] font-extrabold text-toss-warn">
                  화·목
                  <br />
                  17:00
                </div>
              </div>
            </div>
            <div className="text-center text-[11px] text-toss-muted">
              예상 월 비용 ₩520,000 · 귀가 18:00 이전
            </div>
          </div>
        ) : null}

        <div className="h-[14px]" />
      </div>

      <BottomNav active="home" />
    </>
  );
}
