"use client";

interface ToggleProps {
  on: boolean;
  onChange: (on: boolean) => void;
  ariaLabel?: string;
}

export function Toggle({ on, onChange, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 cursor-pointer rounded-full transition-colors ${
        on ? "bg-toss-blue" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-[3px] block h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-[left] duration-200 ${
          on ? "left-[23px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}
