"use client";
import { useId } from "react";
import { useSeasonalVariant } from "./seasonal-provider";

const COLORS = ["#F28C1B", "#E4007C", "#8E4FC0", "#FFB347"];
const WORD = ["S", "H", "U", "M", "A"] as const;
type Letter = (typeof WORD)[number];

function letterPath(ch: Letter, cx: number, t: number, w: number, h: number): string {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const b = t + h;
  const m = t + h / 2;
  switch (ch) {
    case "S":
      return `M${r} ${t} H${l} V${m} H${r} V${b} H${l}`;
    case "H":
      return `M${l} ${t} V${b} M${r} ${t} V${b} M${l} ${m} H${r}`;
    case "U":
      return `M${l} ${t} V${b} H${r} V${t}`;
    case "M":
      return `M${l} ${b} V${t} L${cx} ${m} L${r} ${t} V${b}`;
    case "A": {
      // The crossbar is split on purpose: the gap is a "bridge" so the
      // triangle inside the A stays attached to the paper, like real papel picado.
      const s = t + h * 0.3;
      const y2 = t + h * 0.65;
      const g = w * 0.14;
      return `M${l} ${b} V${s} L${cx} ${t} L${r} ${s} V${b} M${l} ${y2} H${cx - g} M${cx + g} ${y2} H${r}`;
    }
    default:
      return "";
  }
}

function Diamond({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <polygon
      fill="black"
      points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
    />
  );
}

function Flag({
  x,
  color,
  index,
  uid,
  letter,
}: {
  x: number;
  color: string;
  index: number;
  uid: string;
  letter?: Letter;
}) {
  const id = `${uid}-${index}`;
  return (
    <g className="papel-flag" style={{ animationDelay: `${index * 0.35}s` }}>
      <mask id={id} maskUnits="userSpaceOnUse" x={x - 2} y={3} width={66} height={46}>
        <rect x={x - 2} y={3} width={66} height={46} fill="white" />
        {letter ? (
          <>
            <Diamond cx={x + 8} cy={11} s={3} />
            <Diamond cx={x + 54} cy={11} s={3} />
            <path
              d={letterPath(letter, x + 31, 14, 22, 22)}
              fill="none"
              stroke="black"
              strokeWidth={5}
              strokeLinejoin="bevel"
            />
          </>
        ) : (
          <>
            <circle cx={x + 31} cy={22} r={6} fill="black" />
            <Diamond cx={x + 13} cy={17} s={5} />
            <Diamond cx={x + 49} cy={17} s={5} />
            <circle cx={x + 31} cy={36} r={2} fill="black" />
          </>
        )}
      </mask>
      <g mask={`url(#${id})`}>
        <polygon
          fill={color}
          points={`${x},5 ${x + 62},5 ${x + 62},46 ${x + 52},40 ${x + 41},46 ${x + 31},40 ${x + 21},46 ${x + 10},40 ${x},46`}
        />
      </g>
    </g>
  );
}

export function PapelPicado({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div className={className} aria-hidden="true">
      {/* Desktop and tablet (md and up): 9 flags, letters on flags 3 to 7 */}
      <svg viewBox="0 0 680 56" width="100%" focusable="false" className="hidden md:block">
        <line x1="0" y1="5" x2="680" y2="5" stroke="#8E4FC0" strokeWidth="1" />
        {Array.from({ length: 9 }, (_, i) => (
          <Flag
            key={i}
            uid={`${uid}d`}
            x={10 + i * 74}
            index={i}
            color={COLORS[i % 4]}
            letter={i >= 2 && i <= 6 ? WORD[i - 2] : undefined}
          />
        ))}
      </svg>

      {/* Mobile (below md): only the 5 lettered flags so the word stays legible at 375px */}
      <svg viewBox="0 0 360 56" width="100%" focusable="false" className="md:hidden">
        <line x1="0" y1="5" x2="360" y2="5" stroke="#8E4FC0" strokeWidth="1" />
        {WORD.map((ch, i) => (
          <Flag
            key={ch}
            uid={`${uid}m`}
            x={9 + i * 70}
            index={i}
            color={COLORS[(i + 2) % 4]}
            letter={ch}
          />
        ))}
      </svg>
    </div>
  );
}

export function HeroPapelPicado() {
  const variant = useSeasonalVariant();
  if (!variant) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[56px] z-[5] bg-transparent md:top-[64px]">
      <PapelPicado className="mx-auto block max-w-5xl" />
    </div>
  );
}
