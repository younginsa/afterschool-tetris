interface FitBadgeProps {
  score: number;
}

export function FitBadge({ score }: FitBadgeProps) {
  const mid = score < 80;
  const colorMain = mid ? "text-toss-warn" : "text-toss-success";
  const colorLbl = mid ? "text-toss-warn" : "text-toss-success";
  return (
    <div className="text-right">
      <div className={`text-[20px] font-black leading-none ${colorMain}`}>
        {score}
        <span className="text-[11px]">%</span>
      </div>
      <div className={`mt-px text-[10px] font-bold ${colorLbl}`}>적합도</div>
    </div>
  );
}
