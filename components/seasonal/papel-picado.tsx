"use client";
import { useSeasonalVariant } from "./seasonal-provider";

const COLORS = ["#F28C1B", "#E4007C", "#8E4FC0", "#FFB347"];
const CUT = { fill: "var(--muertos-bg)" };

export function PapelPicado({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 680 56" width="100%" aria-hidden="true" focusable="false" className={className}>
      <line x1="0" y1="5" x2="680" y2="5" stroke="#8E4FC0" strokeWidth="1" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 10 + i * 74;
        return (
          <g key={i} className="papel-flag" style={{ animationDelay: `${i * 0.35}s` }}>
            <polygon
              fill={COLORS[i % 4]}
              points={`${x},5 ${x + 62},5 ${x + 62},46 ${x + 52},40 ${x + 41},46 ${x + 31},40 ${x + 21},46 ${x + 10},40 ${x},46`}
            />
            <circle cx={x + 31} cy={22} r={6} style={CUT} />
            <polygon style={CUT} points={`${x + 13},12 ${x + 18},17 ${x + 13},22 ${x + 8},17`} />
            <polygon style={CUT} points={`${x + 49},12 ${x + 54},17 ${x + 49},22 ${x + 44},17`} />
            <circle cx={x + 31} cy={36} r={2} style={CUT} />
          </g>
        );
      })}
    </svg>
  );
}

export function HeroPapelPicado() {
  const variant = useSeasonalVariant();
  if (!variant) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[56px] z-[5] md:top-[64px]">
      <PapelPicado className="mx-auto block max-w-5xl" />
    </div>
  );
}
