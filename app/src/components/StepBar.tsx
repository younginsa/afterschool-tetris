interface StepBarProps {
  total: number;
  active: number; // 0-based index, dots <= active are filled
}

export function StepBar({ total, active }: StepBarProps) {
  return (
    <div className="flex flex-shrink-0 gap-1 border-b border-toss-border bg-white px-[18px] py-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-[3px] flex-1 rounded-[2px] transition-colors ${
            i <= active ? "bg-toss-blue" : "bg-toss-border-2"
          }`}
        />
      ))}
    </div>
  );
}
