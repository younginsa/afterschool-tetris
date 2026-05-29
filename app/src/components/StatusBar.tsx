export function StatusBar() {
  return (
    <div className="flex h-[54px] flex-shrink-0 items-end justify-between bg-white px-[26px] pb-2 text-[12px] font-bold z-10">
      <span>9:41</span>
      <div className="flex items-center gap-[5px] text-[11px]">
        <span className="tracking-[2px] text-[9px]">●●●</span>
        <span>WiFi</span>
        <span className="relative inline-block h-[10px] w-[20px] rounded-[2px] border-[1.5px] border-toss-text">
          <span className="absolute right-[-3.5px] top-1/2 h-[5px] w-[2px] -translate-y-1/2 rounded-r-[1px] bg-toss-text" />
          <span className="absolute inset-[1.5px] right-1 rounded-[1px] bg-toss-text" />
        </span>
      </div>
    </div>
  );
}
