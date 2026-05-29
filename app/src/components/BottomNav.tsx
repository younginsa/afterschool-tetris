"use client";

import Link from "next/link";

type BottomTab = "home" | "find" | "schedule" | "settings";

interface BottomNavProps {
  active: BottomTab;
}

const TABS: Array<{ key: BottomTab; href: string; icon: string; label: string }> = [
  { key: "home", href: "/", icon: "🏠", label: "홈" },
  { key: "find", href: "/setup", icon: "🔍", label: "학원찾기" },
  { key: "schedule", href: "/schedule", icon: "📅", label: "내스케줄" },
  { key: "settings", href: "/", icon: "⚙️", label: "설정" },
];

export function BottomNav({ active }: BottomNavProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 flex h-[72px] items-center border-t border-toss-border bg-white px-1 pb-[6px]">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className="flex flex-1 flex-col items-center gap-[3px] py-2"
          >
            <span
              className={`text-[20px] transition-colors ${
                isActive ? "text-toss-blue" : "text-toss-tertiary"
              }`}
            >
              {tab.icon}
            </span>
            <span
              className={`text-[10px] font-medium transition-colors ${
                isActive ? "text-toss-blue" : "text-toss-tertiary"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
