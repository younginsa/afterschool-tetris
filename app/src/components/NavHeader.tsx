"use client";

import { useRouter } from "next/navigation";

interface NavHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
}

export function NavHeader({ title, subtitle, backHref }: NavHeaderProps) {
  const router = useRouter();

  const onBack = () => {
    if (backHref) router.push(backHref);
    else router.back();
  };

  return (
    <div className="flex flex-shrink-0 items-center gap-[10px] border-b border-toss-border bg-white px-[18px] pt-[10px] pb-[14px]">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-toss-bg text-[18px] text-toss-text active:scale-95"
      >
        ←
      </button>
      <div>
        <div className="text-[17px] font-extrabold text-toss-text leading-none">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-[3px] text-[11px] text-toss-muted">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}
