"use client";

import type { Academy } from "@/lib/types";

interface ResultsMapProps {
  academies: Array<Academy & { computedFit: number }>;
  topCount: number;
}

/**
 * Static SVG map of Gwanggyo with academy pins. Coordinates come from
 * each academy's `mapPos` (0–390 × 0–220 in mockup space).
 */
export function ResultsMap({ academies, topCount }: ResultsMapProps) {
  const ranked = academies.slice(0, 4);

  return (
    <svg
      width="100%"
      viewBox="0 0 390 220"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="block"
    >
      <rect width="390" height="220" fill="#DEE5EF" />
      {/* Blocks/buildings */}
      <rect x="0" y="0" width="82" height="52" fill="#CBD5E1" rx="3" />
      <rect x="92" y="0" width="108" height="52" fill="#CBD5E1" rx="3" />
      <rect x="210" y="0" width="78" height="52" fill="#CBD5E1" rx="3" />
      <rect x="298" y="0" width="92" height="52" fill="#CBD5E1" rx="3" />
      <rect x="0" y="62" width="118" height="62" fill="#CBD5E1" rx="3" />
      <rect x="128" y="62" width="90" height="62" fill="#CBD5E1" rx="3" />
      <rect x="228" y="62" width="72" height="62" fill="#C8DDD0" rx="3" />
      <rect x="310" y="62" width="80" height="62" fill="#CBD5E1" rx="3" />
      <rect x="0" y="134" width="88" height="86" fill="#CBD5E1" rx="3" />
      <rect x="98" y="134" width="118" height="86" fill="#CBD5E1" rx="3" />
      <rect x="226" y="134" width="88" height="86" fill="#CBD5E1" rx="3" />
      <rect x="324" y="134" width="66" height="86" fill="#CBD5E1" rx="3" />
      {/* Park label */}
      <text
        x="264"
        y="97"
        textAnchor="middle"
        fontSize="8"
        fill="#78A88B"
        fontWeight="700"
        fontFamily="-apple-system,sans-serif"
      >
        공원
      </text>
      {/* Roads */}
      <rect x="83" y="0" width="9" height="220" fill="#E8EDF5" />
      <rect x="200" y="0" width="10" height="220" fill="#E8EDF5" />
      <rect x="300" y="0" width="10" height="220" fill="#E8EDF5" />
      <rect x="0" y="53" width="390" height="9" fill="#E8EDF5" />
      <rect x="0" y="125" width="390" height="9" fill="#E8EDF5" />
      {/* School */}
      <circle cx="155" cy="93" r="18" fill="#3182F6" fillOpacity="0.12" />
      <circle cx="155" cy="93" r="11" fill="#3182F6" />
      <text x="155" y="97" textAnchor="middle" fontSize="11" fill="white">
        🏫
      </text>
      <rect
        x="122"
        y="108"
        width="66"
        height="17"
        fill="white"
        rx="4"
        fillOpacity="0.92"
      />
      <text
        x="155"
        y="120"
        textAnchor="middle"
        fontSize="8.5"
        fill="#3182F6"
        fontWeight="700"
        fontFamily="-apple-system,sans-serif"
      >
        광교초등학교
      </text>
      {/* Home */}
      <circle cx="340" cy="25" r="12" fill="#EC4899" />
      <text x="340" y="29" textAnchor="middle" fontSize="11">
        🏠
      </text>
      {/* Academy pins */}
      {ranked.map((a, i) => {
        const pos = a.mapPos ?? { x: 40 + i * 70, y: 50 + i * 30 };
        const mid = a.computedFit < 80;
        const color = mid ? "#D97706" : "#059669";
        const tinted = mid
          ? "rgba(217,119,6,0.15)"
          : "rgba(5,150,105,0.15)";
        return (
          <g key={a.id}>
            {i === 0 && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={50}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray="5 4"
                opacity={0.4}
              />
            )}
            <circle cx={pos.x} cy={pos.y} r={20} fill={tinted} />
            <circle cx={pos.x} cy={pos.y} r={13} fill={color} />
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              fontSize="9"
              fill="white"
              fontWeight="700"
              fontFamily="-apple-system,sans-serif"
            >
              {a.computedFit}
            </text>
            {i < 2 ? (
              <>
                <rect
                  x={pos.x - 34}
                  y={pos.y + 16}
                  width="68"
                  height="15"
                  rx="3"
                  fill="white"
                  fillOpacity="0.9"
                />
                <text
                  x={pos.x}
                  y={pos.y + 27}
                  textAnchor="middle"
                  fontSize="7.5"
                  fill={mid ? "#B45309" : color}
                  fontWeight="700"
                  fontFamily="-apple-system,sans-serif"
                >
                  {a.name.length > 12
                    ? `${a.name.slice(0, 10)}…`
                    : a.name}
                </text>
              </>
            ) : null}
          </g>
        );
      })}
      {/* Floating count label */}
      <rect
        x="125"
        y="190"
        width="140"
        height="22"
        rx="11"
        fill="#191F28"
        fillOpacity="0.92"
      />
      <text
        x="195"
        y="205"
        textAnchor="middle"
        fontSize="11"
        fill="white"
        fontWeight="700"
        fontFamily="-apple-system,sans-serif"
      >
        조건 맞는 학원 {topCount}개 ↓
      </text>
    </svg>
  );
}
